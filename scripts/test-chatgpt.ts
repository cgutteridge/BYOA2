import { ChatGPTAPI } from '../src/api/chatGPT.js'

async function testChatGPT() {
  console.log('Testing ChatGPT API...')
  
  try {
    const chatGPT = new ChatGPTAPI()
    
    const testData = {
      pubName: 'The Red Lion',
      pubType: 'Castle',
      enemies: '3 orks, 1 goblin',
      prizeItemPower: 'Restores health to all allies',
      giftItemPower: 'Transforms a simple object into another form'
    }

    console.log('\nGenerating quest description with:')
    console.log(JSON.stringify(testData, null, 2))
    
    const result = await chatGPT.generatePubDescription(
      testData.pubName,
      testData.pubType,
      testData.enemies,
      testData.prizeItemPower,
      '',
      testData.giftItemPower
    )

    console.log('\nResult:')
    console.log(result)
  } catch (error) {
    console.error('Error testing ChatGPT:', error)
  }
}

// Run the test
testChatGPT() 
