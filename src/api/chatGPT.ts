
type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class ChatGPTAPI {
  private readonly model = 'gpt-3.5-turbo'
  private readonly proxyUrl = 'https://chris.totl.net/BYOA/proxy.php'

  constructor() {
    // No need for API key or OpenAI instance when using proxy
  }

  private async sendMessage(messages: Message[]): Promise<string> {
    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`API Error: ${JSON.stringify(error)}`)
      }

      const data = await response.json()
      return data.choices[0].message.content || ''
    } catch (error) {
      console.error('Error calling ChatGPT API via proxy:', error)
      throw error
    }
  }

  async generatePubDescription(pubName: string, pubType: string, enemies: string, prize: string): Promise<{
    name: string,
    description: string,
    prizeName: string,
    prizeDescription: string
  }> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a creative quest generator for a pub-crawling game. Generate engaging ' +
            'and humorous quest descriptions. Give me the JSON as plain text, no triple backticks, ' +
            'no code formatting. To defeat each enemy a player must drink a specific drink. Make it lightly ribbing to the players like you want them to fail.'
      },
      {
        role: 'user',
        content: `Generate a quest description for a pub called "${pubName}". 
        In the game the location is a ${pubType} and this quest involve defeating ${enemies}. 
        The prize for success is ${prize}. 
        If there are multiple enemies come up with how they are connected to the location and quest.
        Feel free to invent a backstory for the enemies and location.
        Make it sound like an epic adventure. 
        Explain the quest in detail. Do not promise additional rewards. 
        You may retitle the pub in an amusing way maybe combining the real name with the fantasy theme. 
        Respond in JSON format with the following fields: 
        "name", "description", "prizeName", "prizeDescription"`
      }
    ]

    const json = await this.sendMessage(messages)
    console.log(json)
    return JSON.parse(json)
  }

}
