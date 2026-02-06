/**
 * Auto-Connection Service
 * Epic 6, Story 6.2: Auto-Connection Engine
 * Epic 6, Story 6.5: AI-Powered Connections
 * 
 * Analyzes card content and suggests connections based on similarity
 * Uses AI (OpenAI GPT) when available, falls back to keyword matching
 */

import Notes from "../models/NOTES";
import Connections from "../models/CONNECTIONS";
import { Op } from "sequelize";
import { analyzeConnectionsWithAI, isAIAvailable, estimateAICost, type AIConnectionSuggestion } from "./ai-connection-service";

interface ConnectionSuggestion {
  sourceCardId: string;
  targetCardId: string;
  confidence: number;
  reason: string;
  sourceCard?: Notes;
  targetCard?: Notes;
}

/**
 * Extract meaningful keywords from text (simple stopword removal)
 */
function extractKeywords(text: string): string[] {
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his',
    'her', 'its', 'our', 'their'
  ];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 3) // Only words with 4+ chars
    .filter(word => !stopWords.includes(word));
}

/**
 * Calculate Jaccard similarity between two sets of keywords
 * Returns value between 0.0 (no overlap) and 1.0 (identical)
 */
function calculateJaccardSimilarity(wordsA: string[], wordsB: string[]): number {
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
}

/**
 * Find common keywords between two cards
 */
function findCommonKeywords(wordsA: string[], wordsB: string[]): string[] {
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  return [...setA].filter(x => setB.has(x));
}

/**
 * Analyze cards on a board and suggest connections
 * Story 6.5: Uses AI (OpenAI GPT) when available
 * Story 6.2: Falls back to keyword matching with Jaccard similarity
 * Filters out existing connections
 */
export async function suggestConnections(
  boardId: string,
  minConfidence: number = 0.2,
  useAI: boolean = isAIAvailable() // Auto-detect AI availability or force keyword matching
): Promise<ConnectionSuggestion[]> {
  // Get all active cards on the board
  const cards = await Notes.findAll({
    where: { 
      boardId,
      status: 'active' // Only suggest connections for active cards
    },
    attributes: ['id', 'content', 'type'],
  });
  
  if (cards.length < 2) {
    return []; // Need at least 2 cards to create connections
  }
  
  // Get all existing connections on this board
  const existingConnections = await Connections.findAll({
    where: { boardId },
    attributes: ['SOURCECARDID', 'TARGETCARDID'],
  });
  
  // Create a Set of existing connection pairs for fast lookup
  const existingPairs = new Set<string>();
  existingConnections.forEach(conn => {
    const sourceId = conn.get('SOURCECARDID') as string;
    const targetId = conn.get('TARGETCARDID') as string;
    // Store both directions since connections are bidirectional
    existingPairs.add(`${sourceId}-${targetId}`);
    existingPairs.add(`${targetId}-${sourceId}`);
  });
  
  let suggestions: ConnectionSuggestion[] = [];
  
  // Try AI analysis first if enabled
  if (useAI && isAIAvailable()) {
    try {
      console.log(`[AI] Analyzing ${cards.length} cards (estimated cost: $${estimateAICost(cards.length).toFixed(4)})`);
      
      const aiSuggestions = await analyzeConnectionsWithAI(
        cards.map(c => ({ id: c.id, content: c.content, type: c.type as 'note' | 'idea' | 'plan' }))
      );
      
      // Filter out existing connections
      const filteredAISuggestions = aiSuggestions.filter(suggestion => {
        const pairKey = `${suggestion.sourceCardId}-${suggestion.targetCardId}`;
        return !existingPairs.has(pairKey);
      });
      
      // Map AI suggestions to ConnectionSuggestion format
      suggestions = filteredAISuggestions.map(aiSugg => {
        const sourceCard = cards.find(c => c.id === aiSugg.sourceCardId);
        const targetCard = cards.find(c => c.id === aiSugg.targetCardId);
        
        return {
          sourceCardId: aiSugg.sourceCardId,
          targetCardId: aiSugg.targetCardId,
          confidence: Math.round(aiSugg.confidence * 100) / 100,
          reason: aiSugg.reason,
          sourceCard,
          targetCard,
        };
      });
      
      console.log(`[AI] Found ${suggestions.length} AI-powered suggestions`);
    } catch (error) {
      console.error('[AI] AI analysis failed, falling back to keyword matching:', error);
      // Fall through to keyword matching
      suggestions = [];
    }
  }
  
  // Use keyword matching if AI failed or not available
  if (suggestions.length === 0) {
    console.log('[Keyword] Using keyword matching for suggestions');
    suggestions = await suggestConnectionsKeywordBased(cards, existingPairs, minConfidence);
  }
  
  // Sort by confidence (highest first)
  suggestions.sort((a, b) => b.confidence - a.confidence);
  
  return suggestions;
}

/**
 * Keyword-based connection suggestion (original Story 6.2 algorithm)
 * Extracted as separate function for clarity
 */
async function suggestConnectionsKeywordBased(
  cards: Notes[],
  existingPairs: Set<string>,
  minConfidence: number
): Promise<ConnectionSuggestion[]> {
  const suggestions: ConnectionSuggestion[] = [];
  
  // Compare each pair of cards
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const cardA = cards[i];
      const cardB = cards[j];
      
      // Skip if connection already exists
      const pairKey = `${cardA.id}-${cardB.id}`;
      if (existingPairs.has(pairKey)) {
        continue;
      }
      
      // Extract keywords
      const wordsA = extractKeywords(cardA.content);
      const wordsB = extractKeywords(cardB.content);
      
      // Skip if either card has very few keywords
      if (wordsA.length < 2 || wordsB.length < 2) continue;
      
      // Calculate similarity
      const similarity = calculateJaccardSimilarity(wordsA, wordsB);
      
      // Only suggest if above threshold
      if (similarity >= minConfidence) {
        const commonWords = findCommonKeywords(wordsA, wordsB);
        
        // Generate reason
        let reason = '';
        if (commonWords.length === 1) {
          reason = `Both mention "${commonWords[0]}"`;
        } else if (commonWords.length === 2) {
          reason = `Both mention "${commonWords[0]}" and "${commonWords[1]}"`;
        } else if (commonWords.length > 2) {
          reason = `${commonWords.length} shared keywords: ${commonWords.slice(0, 3).join(', ')}${commonWords.length > 3 ? '...' : ''}`;
        } else {
          reason = 'Similar content';
        }
        
        suggestions.push({
          sourceCardId: cardA.id,
          targetCardId: cardB.id,
          confidence: Math.round(similarity * 100) / 100, // Round to 2 decimals
          reason,
          sourceCard: cardA,
          targetCard: cardB,
        });
      }
    }
  }
  
  return suggestions;
}

/**
 * Suggest connections for a specific card
 * Finds cards that are similar to the given card
 */
export async function suggestConnectionsForCard(
  cardId: string,
  minConfidence: number = 0.2
): Promise<ConnectionSuggestion[]> {
  // Get the target card
  const targetCard = await Notes.findByPk(cardId);
  if (!targetCard) {
    throw new Error('Card not found');
  }
  
  // Get all other cards on the same board
  const otherCards = await Notes.findAll({
    where: {
      boardId: targetCard.boardId,
      status: 'active',
      id: { [require('sequelize').Op.ne]: cardId } // Exclude the target card
    },
    attributes: ['id', 'content', 'type'],
  });
  
  const targetWords = extractKeywords(targetCard.content);
  if (targetWords.length < 2) {
    return []; // Target card has too few keywords
  }
  
  const suggestions: ConnectionSuggestion[] = [];
  
  for (const card of otherCards) {
    const cardWords = extractKeywords(card.content);
    if (cardWords.length < 2) continue;
    
    const similarity = calculateJaccardSimilarity(targetWords, cardWords);
    
    if (similarity >= minConfidence) {
      const commonWords = findCommonKeywords(targetWords, cardWords);
      
      let reason = '';
      if (commonWords.length === 1) {
        reason = `Both mention "${commonWords[0]}"`;
      } else if (commonWords.length === 2) {
        reason = `Both mention "${commonWords[0]}" and "${commonWords[1]}"`;
      } else if (commonWords.length > 2) {
        reason = `${commonWords.length} shared keywords: ${commonWords.slice(0, 3).join(', ')}`;
      } else {
        reason = 'Similar content';
      }
      
      suggestions.push({
        sourceCardId: cardId,
        targetCardId: card.id,
        confidence: Math.round(similarity * 100) / 100,
        reason,
        sourceCard: targetCard,
        targetCard: card,
      });
    }
  }
  
  // Sort by confidence (highest first)
  suggestions.sort((a, b) => b.confidence - a.confidence);
  
  return suggestions;
}
