type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

import { jsonrepair } from 'jsonrepair'

export class ChatGPTAPI {
  private readonly model = 'gpt-3.5-turbo'
  private readonly proxyUrl = 'https://chris.totl.net/BYOA/proxy.php'

  private readonly SYSTEM_ROLE : Message =     {
    role: 'system',
    content: `You are a chaotic, sarcastic dungeon master narrating a ridiculous adventure. 
        Don't say things are quirky or funny, just show it. Be either deadpan or over the top.
        Be wild, cheeky, and risque.  Be outrageous. Your target audience is 18-35 year old nerds. Output JSON only. 
        Do not include backticks in the JSON response. `
  }


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
            temperature: 0.1,
            frequency_penalty: 0.3,
          presence_penalty: 0.3,
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

  async generateGameLocationDescription(
    locationName: string, 
    locationType: string, 
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
      this.SYSTEM_ROLE,
      {
        role: 'user',
        content: `
           Generate a JSON object for the ${locationType} at '${locationName}'. 
           ${giftItemPower ? `The players may find or be given an item with this power: "${giftItemPower}".` : ''}
           The players must defeat ${enemies} to win an item with this power: "${prizeItemPower}".
           
        
        For each item, create a unique name and a story description that ties it to the location and challenge.  
        Do not promise additional rewards. 
        You may retitle the location in an amusing way maybe combining the real name with the fantasy theme. 
        The description field in the JSON response is in the 2nd person and must describe ALL OF the location, 
        ${giftItemPower ? "the item available and why, ":""}, the challenge, and the prize as the situation lies when the
        players arrive. Pick a really random theme but stick to it from grimdark to kids tv show to nature documentary to 80s sitcom. 
        
        ${extraInstructions}

        Respond in JSON format with the following fields: 
        "name", "description", "prizeItemName", "prizeItemDescription"${giftItemPower ? ', "giftItemName", "giftItemDescription"' : ''}
        `
      }
    ]

    const json = await this.sendMessage(messages)
    console.log(json)
    try {
      return JSON.parse(json)
    } catch (error) {
      console.warn('Failed to parse JSON response, attempting repair:', error)
      const repairedJson = jsonrepair(json)
      return JSON.parse(repairedJson)
    }
  }

  async generateMonsterNames(
    locationName: string,
    locationDescription: string,
    monsterGroups: Array<{
      type: string,
      title: string,
      count: number,
      level: string,
      species: string
    }>
  ): Promise<Array<string[]>> {
    const messages: Message[] = [
      this.SYSTEM_ROLE,
      {
        role: 'user',
        content: `
          Generate names for monsters at the location "${locationName}".
          GameLocation description: "${locationDescription}"
          
          I need unique names for each monster.
          
          Here are the monster groups you need to name:
          ${monsterGroups.map((group, index) => `
            Group ${index + 1}: ${group.count}x ${group.title} (${group.species} ${group.level})
          `).join('')}
          
          For each group, provide unique individual names for each monster.
          
          The names should be creative, funny, and fit the monster's species and the location's atmosphere. 
          Do not add the type of monster to the name. Do not write "Lord Vlad the Vampire" just "Lord Vlad".
          It is OK to add other qualifiers to the name to make it more interesting or funny.
          
          Respond in JSON format in a 2 dimensional array. The outer array is groups, and item is an array of 
          strings, one for each monster in the group.
        `
      }
    ]

    console.log(messages)
    const json = await this.sendMessage(messages)
    console.log(json)
    try {
      return JSON.parse(json)
    } catch (error) {
      console.warn('Failed to parse JSON response, attempting repair:', error)
      const repairedJson = jsonrepair(json)
      return JSON.parse(repairedJson)
    }
  }

  async initializeQuest(
    startLocationName: string,
    endLocationName: string,
    locationsCount: number,
    questItemTitle: string
  ): Promise<{
    questDescription: string,
    tokenTitle: string,
    tokenDescription: string
  }> {
    const messages: Message[] = [
      this.SYSTEM_ROLE,
      {
        role: 'user',
        content: `
          Generate a quest starting at "${startLocationName}" . 
          The players will visit at least ${locationsCount} locations of their choice after this to collect tokens that will eventually lead to the "${questItemTitle}" at ${endLocationName}.. 
          
          Create a quest description that explains the overall goal and why the players must collect these tokens. Make
          it epic and over the top. Use the "${questItemTitle}" as a seed for the overall theme.
         
          Also create a name and description for the token item that must be collected at each location they visit.
          This is the name and description for a single item so don't make it plural.
          
          Respond in JSON format with the following fields:
          "questDescription" - A detailed description of the overall quest and its goal
          "tokenTitle" - A catchy name for the tokens that must be collected (singular form)
          "tokenDescription" - A description of what these tokens are and why they're important
        `
      }
    ]

    const json = await this.sendMessage(messages)
    console.log(json)
    try {
      return JSON.parse(json)
    } catch (error) {
      console.warn('Failed to parse JSON response, attempting repair:', error)
      const repairedJson = jsonrepair(json)
      return JSON.parse(repairedJson)
    }
  }
}
