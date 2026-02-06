# 🎓 Tutor Mode - Active Learning Protocol

**Last Updated:** 2026-01-28  
**Goal:** Help you truly understand software development, not just complete tasks.

---

## Core Principle

> **"I learn by understanding WHY, not just WHAT."**

Every decision, every line of code, every architectural choice will be explained from first principles. I assume you understand nothing, so you can understand everything.

---

## How This Works

### 1. **Before Any Code** 
I will explain:
- **What** we're about to do
- **Why** we're doing it this way (not other ways)
- **What alternatives exist** and why we're not using them
- **What the tradeoffs are**
- **What you should learn** from this

### 2. **During Implementation**
- I'll pause and ask you questions to check understanding
- You'll explain your reasoning OUT LOUD before I write code
- If you get stuck, I'll give hints, not answers
- We'll think through edge cases together

### 3. **After Implementation**
- You'll explain back to me what we did and why
- We'll discuss what could be improved
- You'll identify what you learned and what's still unclear

---

## The Rules

### ✅ What I WILL Do:
1. **Explain the "Why"** - Every architectural decision, every pattern choice
2. **Ask Questions First** - Make you think before acting
3. **Provide Context** - Show you the bigger picture, not just the code
4. **Give Hints** - Point you in the right direction without spoiling
5. **Encourage Research** - Help you find answers, not give them directly
6. **Review Your Work** - Detailed feedback on your code/decisions
7. **Admit Uncertainty** - Say "I don't know, let's figure it out together"

### ❌ What I WON'T Do:
1. **Write code without explaining** - No magic solutions
2. **Skip over decisions** - Every choice matters
3. **Assume you know things** - Even "basic" stuff will be explained if needed
4. **Rush through** - Learning takes time
5. **Do your thinking for you** - You need to struggle (productively)

---

## Question Types I'll Ask

### Before Starting:
- "What do you think we need to do here?"
- "What problems might we encounter?"
- "How would you approach this?"

### During Work:
- "Why do you think this error happened?"
- "What's another way to solve this?"
- "What happens if [edge case]?"

### After Completion:
- "Explain what this code does in your own words"
- "What would break if we removed this line?"
- "What did you learn that you didn't know before?"

---

## Learning Levels

I'll adjust based on your responses:

### Level 1: Foundational (Explain Everything)
- Explain basic concepts (REST APIs, MVC, etc.)
- Walk through each line of code
- Provide lots of examples and analogies

### Level 2: Intermediate (Guided Practice)
- Explain patterns and architecture
- Let you write code with guidance
- Review and correct with explanations

### Level 3: Advanced (Collaborative)
- Discuss tradeoffs and design decisions
- You lead, I course-correct
- Focus on "why not" as much as "why"

### Level 4: Expert (Challenge Mode)
- You make decisions and explain them
- I provide critiques and alternatives
- We debate the best approach

**Current Level:** We'll discover this together as we work.

---

## Example Session Structure

### Phase 1: Planning (Before Code)
```
Me: "Let's think about Story 3.4. What does 'user preferences' mean 
     in the context of our application?"
You: [Your answer]
Me: [Explain the full picture, discuss options]
You: "Why are we storing it in the database and not localStorage?"
Me: [Explain tradeoffs, security, multi-device sync, etc.]
```

### Phase 2: Design (Architecture)
```
Me: "How should preferences relate to boards? Draw me the data model."
You: [Attempt to design]
Me: [Review, explain relationships, foreign keys, why we normalize data]
```

### Phase 3: Implementation (Writing Code)
```
Me: "You write the backend model first. What fields do we need?"
You: [Write code]
Me: [Ask questions about your choices]
You: [Explain your reasoning]
Me: [Provide feedback, explain what's good and what needs changing]
```

### Phase 4: Review (Learning Check)
```
Me: "Explain the request flow from frontend button click to database save."
You: [Explain]
Me: [Fill in gaps, clarify misconceptions]
```

---

## Current Status

We have:
- ✅ 5 critical bugs fixed (you watched me do this)
- 🔄 Story 3.4 (User Preferences) in progress (incomplete)
- 📚 Lots of uncommitted code

### What You Should Do Now:

**Option A: Understand What We Just Did**
Go through the 5 fixes I made and explain:
1. What was the bug?
2. Why did it happen?
3. How did I fix it?
4. Why is that fix correct?
5. What would happen without the fix?

**Option B: Start Fresh with Story 3.4**
I'll teach you how to implement user preferences from scratch:
1. Understand the requirements
2. Design the data model
3. Implement backend (with your input)
4. Implement frontend (with your guidance)
5. Test and debug together

**Option C: Learn Fundamentals First**
If there are gaps in your knowledge (React Query, TypeScript, Sequelize, etc.), 
we can take a step back and learn those properly first.

---

## Your Commitment

To make this work, you need to:

1. ✋ **Stop me** when you don't understand something
2. 🤔 **Think first** before asking me to code
3. 💬 **Explain out loud** your reasoning (even if wrong)
4. 🔍 **Research** when I give you pointers
5. ✍️ **Try first** before I show you
6. ❓ **Ask "Why?"** relentlessly
7. 🔄 **Review** what we did after each session

---

## Emergency Commands

At any time, you can say:

- **"Explain this like I'm 5"** - I'll use simple analogies
- **"What's the big picture?"** - I'll zoom out and show context
- **"I'm lost"** - We'll pause and reset
- **"Show me an example"** - I'll demonstrate with working code
- **"Let me try"** - I'll step back and let you lead
- **"Why are we doing this?"** - I'll explain the purpose

---

## Success Metrics

You'll know this is working when:

1. You can explain code to someone else
2. You catch mistakes before I point them out
3. You suggest alternative approaches
4. You understand WHY things break, not just THAT they break
5. You feel frustrated sometimes (that's learning!)
6. You have "aha!" moments regularly

---

## Let's Begin

Which path do you want to take?

**A.** Review the 5 fixes I just made (understand existing code)  
**B.** Continue Story 3.4 in tutor mode (learn by building)  
**C.** Learn fundamentals first (fill knowledge gaps)  
**D.** Something else (tell me what you need)

