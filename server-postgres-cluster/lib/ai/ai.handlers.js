import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

console.log('Claude API Key loaded:', CLAUDE_API_KEY ? 'Present' : 'Missing');
console.log('Claude API Key preview:', CLAUDE_API_KEY ? `${CLAUDE_API_KEY.substring(0, 10)}...` : 'None');


// Example curl commands (replace YOUR_API_KEY with actual key from .env)

// curl https://api.anthropic.com/v1/models \
//      --header "x-api-key: YOUR_API_KEY" \
//      --header "anthropic-version: 2023-06-01"



/**
 * Call Claude API with the given prompt
 */
async function callClaudeAPI(prompt, maxRetries = 3) {
  const safePrompt = prompt
    .replace(/•/g, '-')
    .replace(/\*\*/g, '')
    .replace(/🔴|🟡|🟢/g, '');


  const requestBody = {
    model: 'claude-opus-4-1-20250805',       // use a valid model
    max_tokens: 500,         // max tokens for output
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: `${safePrompt}\n\nIMPORTANT: Respond ONLY with valid JSON, no extra commentary.` }
        ]
      }
    ]
  };

  let attempt = 0;
  const delay = ms => new Promise(res => setTimeout(res, ms));

  while (attempt < maxRetries) {
    try {
      console.log(`Attempt ${attempt + 1}: sending request to Claude API...`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Claude API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error response:', errorText);

        // If it's a 500, retry
        if (response.status === 500) throw new Error(`Claude API 500: ${errorText}`);
        throw new Error(`Claude API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.content?.[0]?.text || '';

    } catch (error) {
      console.error(`Claude API attempt ${attempt + 1} failed:`, error);

      attempt++;
      if (attempt < maxRetries) {
        const backoff = 500 * Math.pow(2, attempt); // 500ms, 1s, 2s...
        console.log(`Retrying after ${backoff}ms...`);
        await delay(backoff);
      } else {
        console.error('Max retries reached, throwing error');
        throw error;
      }
    }
  }
}

/**
 * Parse Claude's JSON response
 */
function parseClaudeResponse(response) {
  try {
    // Extract JSON from the response (Claude might wrap it in markdown)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Invalid response format from Claude');
  }
}

/**
 * Factory function to create AI handlers
 */
export default function (components) {
  return {
    /**
     * Prioritize todos using Claude AI
     */
    prioritizeTodos: async (req, res) => {
      try {
        const { todos, preferences, prompt } = req.body;
        
        console.log('AI Prioritize request received:', { 
          todosCount: todos?.length, 
          hasPreferences: !!preferences, 
          hasPrompt: !!prompt,
          apiKey: CLAUDE_API_KEY ? 'Set' : 'Not set'
        });
        console.log('AI Prioritize - Received preferences:', preferences);
        
        if (!todos || !preferences) {
          return res.status(400).json({ error: 'Todos and preferences are required' });
        }

        console.log('Prioritizing todos with Claude...');
        
        // Call Claude API
        console.log('Calling Claude API with prompt length:', prompt.length);
        let claudeResponse;
        let prioritizedTodos;
        
        try {
          claudeResponse = await callClaudeAPI(prompt);
          console.log('Claude response received, length:', claudeResponse.length);
          
          // Parse the response
          prioritizedTodos = parseClaudeResponse(claudeResponse);
        } catch (claudeError) {
          console.error('Claude API failed, using fallback prioritization:', claudeError);
          
          // Fallback: simple prioritization based on preferences
          prioritizedTodos = todos.map((todo, index) => ({
            id: todo.id,
            aiPriority: index + 1,
            aiReason: 'Fallback prioritization (Claude API unavailable)'
          }));
        }
        
        // Merge AI prioritization with original todos
        const enhancedTodos = todos.map(todo => {
          const aiData = prioritizedTodos.find(p => p.id === todo.id);
          return {
            ...todo,
            aiPriority: aiData ? aiData.aiPriority : 999,
            aiReason: aiData ? aiData.aiReason : 'No AI analysis available'
          };
        });

        // Sort by AI priority
        enhancedTodos.sort((a, b) => a.aiPriority - b.aiPriority);

        res.json(enhancedTodos);
      } catch (error) {
        console.error('Error in prioritizeTodos:', error);
        res.status(500).json({ error: 'AI prioritization failed' });
      }
    },

    /**
     * Get AI insights about task patterns
     */
    getInsights: async (req, res) => {
      try {
        const { todos, preferences, prompt } = req.body;
        
        if (!todos || !preferences) {
          return res.status(400).json({ error: 'Todos and preferences are required' });
        }

        console.log('Getting AI insights...');
        
        // Call Claude API
        const claudeResponse = await callClaudeAPI(prompt);
        console.log('Claude insights received');
        
        res.json({ insight: claudeResponse });
      } catch (error) {
        console.error('Error in getInsights:', error);
        res.status(500).json({ error: 'AI insights failed' });
      }
    }
  };
}
