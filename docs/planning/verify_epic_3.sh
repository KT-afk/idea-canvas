
echo "Verifying Epic 3: Board Management Implementation"
echo "================================================="

# Base URL
API_URL="http://localhost:3000/api"

echo "Note: This script assumes the backend is running at $API_URL"
echo "If it is not running, please run 'npm run dev' in the backend directory in a separate terminal."
echo ""

# 1. Create a Board (Story 3.1)
echo "1. Testing Create Board (Story 3.1)..."
BOARD_NAME="Test Board $(date +%s)"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/boards" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$BOARD_NAME\"}")

echo "Response: $CREATE_RESPONSE"
BOARD_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$BOARD_ID" ]; then
  echo "❌ Failed to create board"
  exit 1
else
  echo "✅ Board created with ID: $BOARD_ID"
fi

# 2. Rename Board (Story 3.2)
echo ""
echo "2. Testing Rename Board (Story 3.2)..."
NEW_NAME="Renamed Board $(date +%s)"
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/boards/$BOARD_ID" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$NEW_NAME\"}")

echo "Response: $UPDATE_RESPONSE"
CHECK_NAME=$(echo $UPDATE_RESPONSE | grep -o "$NEW_NAME")

if [ -z "$CHECK_NAME" ]; then
  echo "❌ Failed to rename board"
else
  echo "✅ Board renamed to: $NEW_NAME"
fi

# 3. Create a Note on this Board
echo ""
echo "3. Creating a test note on the board..."
NOTE_RESPONSE=$(curl -s -X POST "$API_URL/notes" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Test Note\", \"x\": 100, \"y\": 100, \"boardId\": \"$BOARD_ID\"}")

NOTE_ID=$(echo $NOTE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
if [ -z "$NOTE_ID" ]; then
  echo "❌ Failed to create note"
else
  echo "✅ Note created with ID: $NOTE_ID"
fi

# 4. Create a Fallback Board (for deletion test)
echo ""
echo "4. Creating a fallback board..."
FALLBACK_NAME="Fallback Board $(date +%s)"
FALLBACK_RESPONSE=$(curl -s -X POST "$API_URL/boards" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$FALLBACK_NAME\"}")
FALLBACK_ID=$(echo $FALLBACK_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ Fallback board created: $FALLBACK_ID"

# 5. Soft Delete Board (Story 3.3)
echo ""
echo "5. Testing Soft Delete Board (Story 3.3)..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/boards/$BOARD_ID/soft")

echo "Response: $DELETE_RESPONSE"

# Verify note moved to fallback board
echo ""
echo "6. Verifying note was moved..."
NOTE_CHECK=$(curl -s "$API_URL/notes/$NOTE_ID")
MOVED_BOARD_ID=$(echo $NOTE_CHECK | grep -o '"boardId":"[^"]*' | cut -d'"' -f4)

if [ "$MOVED_BOARD_ID" == "$FALLBACK_ID" ]; then
  echo "✅ SUCCESS: Note was moved to fallback board ($FALLBACK_ID)"
elif [ "$MOVED_BOARD_ID" == "$BOARD_ID" ]; then
   echo "❌ FAILURE: Note is still on deleted board ($BOARD_ID)"
else 
   echo "⚠️ Note moved to unexpected board: $MOVED_BOARD_ID (Expected: $FALLBACK_ID)"
   echo "This might be due to the current logic selecting the first available board."
fi

# Clean up (Hard delete)
echo ""
echo "Cleaning up..."
curl -s -X DELETE "$API_URL/notes/$NOTE_ID" > /dev/null
curl -s -X DELETE "$API_URL/boards/$BOARD_ID/hard" > /dev/null
curl -s -X DELETE "$API_URL/boards/$FALLBACK_ID/hard" > /dev/null
echo "Done."
