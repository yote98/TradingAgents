/**
 * MCP Client for Thesys C1
 * Connects to MCP servers and provides tools to the LLM
 */

export interface MCPTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

export class MCPClient {
  private mcpServerUrl: string;

  constructor(mcpServerUrl: string) {
    this.mcpServerUrl = mcpServerUrl;
  }

  /**
   * List available tools from the MCP server
   */
  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/tools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to list MCP tools:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.tools || [];
    } catch (error) {
      console.error('Error listing MCP tools:', error);
      return [];
    }
  }

  /**
   * Execute a tool via the MCP server
   */
  async runTool(toolName: string, args: any): Promise<any> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/call-tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: toolName,
          arguments: args,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tool execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error running tool ${toolName}:`, error);
      throw error;
    }
  }
}

/**
 * Get Alpha Vantage MCP client
 */
export function getAlphaVantageMCP(): MCPClient {
  const mcpUrl = process.env.ALPHA_VANTAGE_MCP_URL || 'https://mcp.alphavantage.co/mcp?apikey=H0MDWALD76X9X96C';
  return new MCPClient(mcpUrl);
}
