require('dotenv').config()
const ethers = require('ethers')
const axios = require('axios')

const Auction_SC = require('../constants/auction_sc_abi')
const rpcapi = process.env.NETWORK_RPC
const chainID = parseInt(process.env.NETWORK_CHAINID)
const provider = new ethers.providers.JsonRpcProvider(rpcapi, chainID)
const apiEndPoint = process.env.API_ENDPOINT

const loadAuctionContract = () => {
  let abi = Auction_SC.abi
  let address = process.env.CONTRACTADDRESS

  let contract = new ethers.Contract(address, abi, provider)
  return contract
}

const auctionSC = loadAuctionContract()

const toLowerCase = (val) => {
  if (val) return val.toLowerCase()
  else return val
}
const parseToFTM = (inWei) => {
  return parseFloat(inWei.toString()) / 10 ** 18
}
const convertTime = (value) => {
  return parseFloat(value) * 1000
}

const callAPI = async (endpoint, data) => {
  await axios({
    method: 'post',
    url: apiEndPoint + endpoint,
    data,
  })
}

const trackAuction = () => {
  console.log('auction tracker has been started')

  auctionSC.on('AuctionCreated', async (nftAddress, tokenID) => {
    nftAddress = toLowerCase(nftAddress)
    tokenID = parseInt(tokenID)
    await callAPI('auctionCreated', { nftAddress, tokenID })
  })

  auctionSC.on(
    'UpdateAuctionStartTime',
    async (nftAddress, tokenID, startTime) => {
      nftAddress = toLowerCase(nftAddress)
      tokenID = parseInt(tokenID)
      startTime = convertTime(startTime)
      await callAPI('updateAuctionStartTime', {
        nftAddress,
        tokenID,
        startTime,
      })
    },
  )

  auctionSC.on('UpdateAuctionEndTime', async (nftAddress, tokenID, endTime) => {
    nftAddress = toLowerCase(nftAddress)
    tokenID = parseInt(tokenID)
    endTime = convertTime(endTime)
    await callAPI('updateAuctionEndTime', { nftAddress, tokenID, endTime })
  })
  auctionSC.on(
    'UpdateAuctionReservePrice',
    async (nftAddress, tokenID, paymentToken, reservePrice) => {
      nftAddress = toLowerCase(nftAddress)
      tokenID = parseInt(tokenID)
      paymentToken = toLowerCase(paymentToken)
      reservePrice = parseToFTM(reservePrice)
      await callAPI('updateAuctionReservePrice', {
        nftAddress,
        tokenID,
        paymentToken,
        reservePrice,
      })
    },
  )

  auctionSC.on('BidPlaced', async (nftAddress, tokenID, bidder, bid) => {
    nftAddress = toLowerCase(nftAddress)
    tokenID = parseInt(tokenID)
    bidder = toLowerCase(bidder)
    bid = parseToFTM(bid)
    await callAPI('bidPlaced', { nftAddress, tokenID, bidder, bid })
  })

  auctionSC.on('BidWithdrawn', async (nftAddress, tokenID, bidder, bid) => {
    nftAddress = toLowerCase(nftAddress)
    tokenID = parseInt(tokenID)
    bidder = toLowerCase(bidder)
    bid = parseToFTM(bid)
    await callAPI('bidWithdrawn', { nftAddress, tokenID, bidder, bid })
  })

  auctionSC.on(
    'AuctionResulted',
    async (
      nftAddress,
      tokenID,
      winner,
      paymentToken,
      unitPrice,
      winningBid,
    ) => {
      nftAddress = toLowerCase(nftAddress)
      tokenID = parseInt(tokenID)
      winner = toLowerCase(winner)
      paymentToken = toLowerCase(paymentToken)
      winningBid = parseToFTM(winningBid)
      await callAPI('auctionResulted', {
        nftAddress,
        tokenID,
        winner,
        paymentToken,
        winningBid,
      })
    },
  )
  auctionSC.on('AuctionCancelled', async (nftAddress, tokenID) => {
    nftAddress = toLowerCase(nftAddress)
    tokenID = parseInt(tokenID)
    await callAPI('auctionCancelled', { nftAddress, tokenID })
  })
}

module.exports = trackAuction
