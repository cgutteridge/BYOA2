import { ChatGPTAPI } from '../src/api/chatGPT.js'
import { jsonrepair } from 'jsonrepair'

async function testChatGPTQuest() {
  console.log('Testing ChatGPT Quest Initialization...')
  
  try {
    const chatGPT = new ChatGPTAPI()
    
    const testData = {
      startLocationName: 'The Red Bar',
      endLocationName: 'The Scholars Arms',
      locationsCount: 5,
      questItemTitle: 'The Stick of the Black Badger'
    }

    console.log('\nInitializing quest with:')
    console.log(JSON.stringify(testData, null, 2))
    
    const result = await chatGPT.initializeQuest(
      testData.startLocationName,
      testData.endLocationName,
      testData.locationsCount,
      testData.questItemTitle
    )

    console.log('\nGenerated Quest Initialization:')
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Error testing ChatGPT Quest:', error)
  }
}

// Run the test
testChatGPTQuest() 