import { ChatGPTAPI } from '../src/api/chatGPT.js'
import { jsonrepair } from 'jsonrepair'

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
    
    const result = await chatGPT.generateGameLocationDescription(
      testData.pubName,
      testData.pubType,
      testData.enemies,
      testData.prizeItemPower,
      '',
      testData.giftItemPower
    )

    console.log('\nResult:')
    console.log(result)
    
    // Test JSON repair functionality with broken JSON
    console.log('\nTesting JSON repair functionality:')
    const brokenJson = `{
      "name": "Broken Castle,
      "description": "This JSON is broken",
      prizeItemName: "Missing quotes",
      "prizeItemDescription": "This has an unclosed string
    }`
    
    console.log('Broken JSON:')
    console.log(brokenJson)
    
    try {
      // This should fail
      JSON.parse(brokenJson)
      console.log('ERROR: Parsed broken JSON without repair (should have failed)')
    } catch (error) {
      console.log('Expected error parsing broken JSON:', error.message)
      
      try {
        // This should succeed
        const repaired = jsonrepair(brokenJson)
        console.log('Repaired JSON:')
        console.log(repaired)
        
        const parsed = JSON.parse(repaired)
        console.log('Successfully parsed repaired JSON:', parsed)
      } catch (repairError) {
        console.error('Error repairing JSON:', repairError)
      }
    }
  } catch (error) {
    console.error('Error testing ChatGPT:', error)
  }
}

// Run the test
testChatGPT() 
