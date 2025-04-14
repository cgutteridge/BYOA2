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
            temperature: 1.25,
            frequency_penalty: 1,
          presence_penalty: 0.6,
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

  async generatePubDescription(
    pubName: string, 
    pubType: string, 
    enemies: string, 
    prizeItemPower: string, 
    extraInstructions: string = '',
    giftItemPower?: string
  ): Promise<{
    name: string,
    description: string,
    prizeItemName: string,
    prizeItemDescription: string,
    giftItemName?: string,
    giftItemDescription?: string
  }> {
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a chaotic, sarcastic dungeon master narrating a ridiculous adventure. 
        Don't say things are quirky or funny, just show it. Be either deadpan or over the top.
        Be wild, cheeky, and make fun of the players. Output JSON only. 
        Do not include backticks in the JSON response. `
     },
     
      {
        role: 'user',
        content: `
           Generate a JSON object for the ${pubType} at '${pubName}'. 
           ${giftItemPower ? `The players may find or be given an item with this power: "${giftItemPower}".` : ''}
           The players must defeat ${enemies} to win an item with this power: "${prizeItemPower}".
            Be outrageous."
        
        For each item, create a unique name and a story description that ties it to the location and challenge.  
        Do not promise additional rewards. 
        You may retitle the location in an amusing way maybe combining the real name with the fantasy theme. 
        The description field in the JSON response must describe ALL OF the location, 
        ${giftItemPower ? "the item available and why, ":""}, the challenge, and the prize.
        
        ${extraInstructions}

        Respond in JSON format with the following fields: 
        "name", "description", "prizeItemName", "prizeItemDescription"${giftItemPower ? ', "giftItemName", "giftItemDescription"' : ''}
        `
      }
    ]

    const json = await this.sendMessage(messages)
    console.log(json)
    return JSON.parse(json)
  }

  async generateMonsterNames(
    pubName: string,
    pubDescription: string,
    monsterGroups: Array<{
      type: string,
      title: string,
      count: number,
      level: string,
      species: string
    }>
  ): Promise<Array<string[]>> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a chaotic, sarcastic dungeon master naming creatures in a ridiculous adventure. Be wild, cheeky, and creative with the names. Output JSON only. Do not include backticks in the JSON response.'
      },
      {
        role: 'user',
        content: `
          Generate names for monsters at the location "${pubName}".
          Location description: "${pubDescription}"
          
          I need unique names for each monster.
          
          Here are the monster groups you need to name:
          ${monsterGroups.map((group, index) => `
            Group ${index + 1}: ${group.count}x ${group.title} (${group.species} ${group.level})
          `).join('')}
          
          For each group, provide unique individual names for each monster.
          
          The names should be creative, funny, and fit the monster's species and the pub's atmosphere. 
          Do not add the type of monster to the name. Do not write "Lord Vlad the Vampire" just "Lord Vlad".
          It is OK to add other qualifiers to the name to make it more interesting or funny.
          
          Respond in JSON format as an array with arrays of names for each group:
          [
            ["Monster 1 name", "Monster 2 name", ...etc for group 1],
            ["Monster 1 name", "Monster 2 name", ...etc for group 2],
            ...etc for each monster group
          ]
        `
      }
    ]

    console.log(messages)
    const json = await this.sendMessage(messages)
    console.log(json)
    return JSON.parse(json)
  }
}
