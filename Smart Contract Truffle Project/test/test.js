const { assert, AssertionError } = require('chai')

const Morse = artifacts.require('./MorseV2.sol')
require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Morse', (accounts) =>{
    let contract

    before(async () => {
        contract = await Morse.deployed();
    })

    describe('Deployment', async () => {
        it('Deploys Successfuly', async () => {
            const address = contract.address
            assert.notEqual(address, '')
            assert.notEqual(address, 0x0)
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('Has a Name', async () => {
            const name = await contract.name();
            assert.equal(name, 'Morse')
        })

        it('Has a Symbol', async () => {
            const symbol = await contract.symbol();
            assert.equal(symbol, 'MORSE')
        })
    })

    describe('Minting', async () =>{
       it('Creates a New Token', async () =>{
           const result = await contract.mint(1)
           const totalSupply = await contract.totalSupply()
           //SUCCESS
           assert.equal(totalSupply, 1)
           const event = result.logs[0].args
           assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct')
           assert.equal(event.to, accounts[0], 'to is correct')
       }) 
    })

    describe('Set URI', async () =>{
        it('Changes URI', async () =>{ //or it gets the hose
            let testURI = 'https://testUri'

            await contract.setBaseURI(testURI)
            await contract.setNotRevealedURI(testURI)
            const totalSupply = await contract.totalSupply()
            
            let tokenURI = await contract.tokenURI(totalSupply)
            //console.log(`TokenURI: ${tokenURI}`)
            assert(tokenURI.includes(testURI))
        }) 
     })
})