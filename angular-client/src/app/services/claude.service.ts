import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Todo, UserPreferences } from '../models/store';

export interface PrioritizedTodo extends Todo {
  aiPriority: number;
  aiReason: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClaudeService {
 
  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Get AI-powered task prioritization based on user preferences
   */
  prioritizeTodos(todos: Todo[], preferences: UserPreferences): Observable<PrioritizedTodo[]> {
    console.log('ClaudeService - Received preferences for prioritization:', preferences);
    const prompt = this.buildPrioritizationPrompt(todos, preferences);
    console.log('ClaudeService - Generated prompt:', prompt);
    
    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<PrioritizedTodo[]>(`${environment.serverUrl}/ai/prioritize`, {
      todos,
      preferences,
      prompt
    }, { headers });
  }

  /**
   * Build a comprehensive prompt for Claude to analyze and prioritize tasks
   */
  private buildPrioritizationPrompt(todos: Todo[], preferences: UserPreferences): string {
    const activeTodos = todos.filter(todo => !todo.completed);
  
    // Use the consistent preference formatting method
    const preferencesText = this.formatPreferences(preferences);
  
    // Simplify todos (remove emojis and bullets)
    const todosText = activeTodos.map(todo => 
      `${todo.title} (Priority: ${todo.priority}, Assigned to: ${todo.assignedTo})`
    ).join('\n') || 'No active todos found.';
  
    return `You are an AI assistant helping to prioritize household tasks based on user preferences and responsibilities.
  
  USER PREFERENCES:
  ${preferencesText}
  
  CURRENT TODOS:
  ${todosText}
  
  TASK: Reorder these todos based on user preferences and responsibilities, considering:
  1. Urgency (tasks that are time-sensitive)
  2. Preference alignment (tasks the user prefers)
  3. Dependencies (tasks that need to be done before others)
  4. Energy levels (when tasks are typically done)
  5. Family impact (tasks affecting others)
  
  RESPONSE FORMAT:
  Return a JSON array of objects with this structure:
  [
    {
      "id": "todo-id",
      "aiPriority": 1,
      "aiReason": "Brief explanation of why this priority"
    }
  ]
  
  Respond ONLY with valid JSON, no extra text.`;
  }

  /**
   * Format user preferences for the prompt
   */
  private formatPreferences(preferences: UserPreferences): string {
    const activePreferences = Object.entries(preferences)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key);

    if (activePreferences.length === 0) {
      return "No specific preferences set - user is open to all types of tasks.";
    }

    return activePreferences.map(pref => {
      const descriptions = {
        petCare: "Pet care (feeding, walking, grooming)",
        laundry: "Laundry and clothing care",
        cooking: "Cooking and meal preparation",
        organization: "Organization and tidying",
        plantCare: "Plant care and gardening",
        houseWork: "House cleaning and maintenance",
        yardWork: "Yard work and outdoor maintenance",
        familyCare: "Family care and childcare"
      };
      return `• ${descriptions[pref as keyof typeof descriptions] || pref}`;
    }).join('\n');
  }

  /**
   * Format todos for the prompt
   */
  private formatTodos(todos: Todo[]): string {
    if (todos.length === 0) {
      return "No active todos found.";
    }

    return todos.map(todo => {
      const priorityEmoji = {
        'Hi-Pri': '🔴',
        'Medium': '🟡',
        'Low': '🟢'
      };
      
      return `• ${priorityEmoji[todo.priority as keyof typeof priorityEmoji] || '⚪'} ${todo.title} (Priority: ${todo.priority}, Assigned to: ${todo.assignedTo})`;
    }).join('\n');
  }

  /**
   * Get AI insights about task patterns and suggestions
   */
  getTaskInsights(todos: Todo[], preferences: UserPreferences): Observable<string> {
    const prompt = `Based on the user's preferences and todo history, provide 2-3 actionable insights or suggestions for better task management.

USER PREFERENCES:
${this.formatPreferences(preferences)}

RECENT TODOS:
${this.formatTodos(todos.slice(-10))} // Last 10 todos

Provide brief, practical insights that could help the user manage their household tasks more effectively.`;

    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<{insight: string}>(`${environment.serverUrl}/ai/insights`, {
      todos,
      preferences,
      prompt
    }, { headers }).pipe(
      map(response => response.insight)
    );
  }
}

// Import map operator
import { map } from 'rxjs/operators';
