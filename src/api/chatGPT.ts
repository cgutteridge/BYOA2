type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

import { jsonrepair } from 'jsonrepair'

export class ChatGPTAPI {
  private readonly model = 'gpt-3.5-turbo'
  private readonly proxyUrl = 'https://chris.totl.net/BYOA/proxy.php'
  private readonly MAX_RETRIES = 3

  private readonly SYSTEM_ROLE : Message = {
    role: 'system',
    content: `You are a chaotic, sarcastic dungeon master narrating a ridiculous adventure. 
        Don't say things are quirky or funny, just show it. Be either deadpan or over the top.
        Be wild, cheeky, and risque. Pop culture references should be parody not just a rip off.
        Be outrageous. Be anachronistic and maybe mix in modern, scifi
        and any other different genres. Your target audience is 18-35 year old nerds. Output JSON only. 
        Do not include backticks in the JSON response. `
  }


  constructor() {
    // No need for API key or OpenAI instance when using proxy
  }

  private async sendMessage<T>(messages: Message[]): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        //console.log(`API attempt ${attempt}/${this.MAX_RETRIES}`)
        
        const response = await fetch(this.proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: 1.3,
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
        const content = data.choices[0].message.content || ''
        //console.log('------',messages,content)
        
        try {
          return JSON.parse(content) as T
        } catch (error) {
          console.warn('Failed to parse JSON response, attempting repair:', error)
          const repairedJson = jsonrepair(content)
          return JSON.parse(repairedJson) as T
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Error on attempt ${attempt}/${this.MAX_RETRIES}:`, error)
        
        if (attempt === this.MAX_RETRIES) {
          console.error('All retry attempts failed')
          throw lastError
        }
      }
    }
    
    // This should never be reached due to the throw in the loop,
    // but TypeScript needs it for type safety
    throw new Error('All retry attempts failed')
  }
  //generateGameLocationStashDescription

  async generateGameLocationStashDescription(
      locationName: string,
      giftItemPower: string
  ): Promise<{
    locationName: string,
    locationDescription: string,
    itemName: string,
    itemDescription: string
  }> {
    const stopWords = ['junction','of','','street','avenue','lane','road','way','&']
    const parts = locationName.toLowerCase().split(' ').filter(
        word=>!stopWords.includes(word)
    )
    const messages: Message[] = [
      this.SYSTEM_ROLE,
      {
        role: 'user',
        content: `
           Generate a JSON object for a minor outdoor location in the storyline of the adventure you are running.
           Use the words "${parts.join('","')}" as inspiration for the story and item the players receieve here. 

           In this case, The players will find or be given an item with this power: "${giftItemPower}". Do not promise additional rewards or powers. 

        name: the name of the location
        itemName: the name of the item the players discover or are given     
        itemDescription: the backstory of the item the players discover or are given
        description: description, in the 2nd person, of the location and how the players discover or are given the item 
        
        Respond in JSON format with the following fields: 
        "locationName", "locationDescription","itemName", "itemDescription"
        `
      }
    ]

    return this.sendMessage(messages)
  }

  async generateGameLocationShopDescription(
      locationName: string
  ): Promise<{
    locationName: string,
    locationDescription: string
  }> {
    const stopWords = ['junction','of','','street','avenue','lane','road','way','&']
    const parts = locationName.toLowerCase().split(' ').filter(
        word=>!stopWords.includes(word)
    )
    const messages: Message[] = [
      this.SYSTEM_ROLE,
      {
        role: 'user',
        content: `
           Generate a JSON object for a shop, stall or market in the storyline of the adventure you are running.
           Use the words "${parts.join('","')}" as inspiration for the story.
           The players can only get one item from the items available; make up a reason why. Either not enough gold, 
           or time pressure, or a law, or a grumpy seller etc.
           
        name: the name of the location
        description: description, in the 2nd person, of the location and how the players discover or are given the item 
        
        Respond in JSON format with the following fields: 
        "locationName", "locationDescription"
        `
      }
    ]

    return this.sendMessage(messages)
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

    return this.sendMessage(messages)
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
          Generate names for enemies at the location "${locationName}".
          GameLocation description: "${locationDescription}"
          
          For each group, provide unique individual names for each enemy.
          
          The names should be creative, funny, and fit the enemy's species and the location's atmosphere. 
          Do not add the type of enemy to the name. Do not write "Lord Vlad the Vampire" just "Lord Vlad".
          It is OK to add other qualifiers to the name to make it more interesting or funny.
          
          Respond in JSON format in a 2 dimensional array. The outer array is groups, and item is an array of 
          strings, one for each enemy in the group. One distinct per enemy name per JSON string. per  eg:
           [["bill","ben the goth"],["cheeto man"]]
         
         Do not provide an outer object.
         
         Here are the monster groups you need to name:
          ${monsterGroups.map((group, index) => `
            Group ${index + 1}: ${group.count}x ${group.title} (${group.species} ${group.level})
          `).join('')}
        `
      }
    ]

    // console.log(messages)
    return this.sendMessage(messages)
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

    return this.sendMessage(messages)
  }


  async generateEndGameLocationDescription(
    locationName: string, 
    locationType: string, 
    enemies: string, 
    questTitle: string,
    questDescription: string,
    tokenTitle: string,
    tokenDescription: string,
    tokenCount: number
  ): Promise<{
    locationName: string,
    locationDescription: string,
    questItemDescription: string,
  }> {
    const messages: Message[] = [
      this.SYSTEM_ROLE,
      {
        role: 'user',
        content: `
        We are at the end of a long quest. The quest was to seek the "${questTitle}". 
        
        QUEST DETAILS:
        ${questDescription} 
      
        The last location is the  ${locationType} at '${locationName}'. The players have collected 
        the required ${tokenCount} of "${tokenTitle}" to access this location. 
        
        ${tokenTitle}: ${tokenDescription}

         Generate a JSON object for the final location of the quest. 
           
         The players must defeat ${enemies} to win the goal of their quest; "
        
        You should re-title the location in an amusing way maybe riffing on the real name with the fantasy theme. 
        
        The description field in the JSON response is in the 2nd person and must describe ALL OF the location, 
        the challenge, and the prize as the situation lies when the players arrive. The location and challenge should 
        pull together the themes of the quest description, the item being quested for, the token items the players 
        collected and the monsters they need to defeat here.
        
        In addition to the title and description of the location, please provide the flavour text
        that the player will see as the detailed description of the "${questTitle}" when they receive it
        after defeating all foes.

        Respond in JSON format with the following fields: 
        "locationName", "locationDescription", "questItemDescription"
        `
      }
    ]

    return this.sendMessage(messages)
  }



}
