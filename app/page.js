"use client"
import { useEffect, useState } from "react"
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddressSync } from "@solana/spl-token"
import { AnchorProvider, Program } from "@coral-xyz/anchor"

// Import config & IDL
import config from "@/app/config.json"
import Crowdsale from "@/app/idl/crowdsale.json"

// Import components
import Header from "./components/Header"

export default function Home() {
  const [provider, setProvider] = useState(null)
  const [anchorProvider, setAnchorProvider] = useState(null)
  const [user, setUser] = useState(null)
  const [userBalance, setUserBalance] = useState(0)
  const [userTokenBalance, setUserTokenBalance] = useState(0)
  const [crowdsaleProgram, setCrowdsaleProgram] = useState(null)
  const [crowdsaleBalance, setCrowdsaleBalance] = useState(0)
  const [crowdsaleTokenBalance, setCrowdsaleTokenBalance] = useState(0)
  const [crowdsaleCost, setCrowdsaleCost] = useState(0)

  const getProvider = async () => {
    if ('phantom' in window) {
      const provider = window.phantom?.solana;

      if (provider?.isPhantom) {
        setProvider(provider)

        provider.on("connect", async (publicKey) => {
          // Setup connection to cluster
          const connection = new Connection(clusterApiUrl("devnet"), "confirmed")
          const anchorProvider = new AnchorProvider(connection, publicKey)

          // Set the anchor connection & user
          setAnchorProvider(anchorProvider)
          setUser(publicKey)

          // Initantiate the program
          const crowdsaleProgram = new Program(
            Crowdsale,
            anchorProvider
          )
          setCrowdsaleProgram(crowdsaleProgram)

          // Fetch the current state of the crowdsale
          const crowdsaleState = await crowdsaleProgram.account.crowdsale.fetch(config.CROWDSALE_PDA)
          setCrowdsaleCost(crowdsaleState.cost)

          // Fetch balances
          await getUserBalance(anchorProvider)
          await getCrowdsaleBalance(anchorProvider)
        })

        provider.on("disconnect", () => {
          setUser(null)
        })
      }
    }
  }

  const getUserBalance = async (anchorProvider) => {
    // Setup public keys
    const userPublicKey = new PublicKey(anchorProvider.wallet)
    const tokenPublicKey = new PublicKey(config.TOKEN_MINT_ACCOUNT)

    // Get user's SOL balance
    const userBalance = await anchorProvider.connection.getBalance(userPublicKey)
    setUserBalance(userBalance)

    // Get user's Token balance
    // Since the user might have 0, we need to get their account info
    const userTokenAccount = getAssociatedTokenAddressSync(tokenPublicKey, userPublicKey, true)
    const userTokenAccountInfo = await anchorProvider.connection.getAccountInfo(userTokenAccount)

    // If they have never had a balance, their account info will be null
    if (userTokenAccountInfo) {
      const userTokenBalance = await anchorProvider.connection.getTokenAccountBalance(userTokenAccount)
      setUserTokenBalance(userTokenBalance.value.amount)
    }
  }

  const getCrowdsaleBalance = async (anchorProvider) => {
    // Setup public keys
    const crowdsalePDAKey = new PublicKey(config.CROWDSALE_PDA)
    const crowdsalePDATokenKey = new PublicKey(config.CROWDSALE_PDA_TOKEN_ACCOUNT)

    // Get Crowdsale's SOL balance
    const crowdsaleBalance = await anchorProvider.connection.getBalance(crowdsalePDAKey)
    setCrowdsaleBalance(crowdsaleBalance)

    // Get Crowdsale's Token balance
    const crowdsaleTokenBalance = await anchorProvider.connection.getTokenAccountBalance(crowdsalePDATokenKey)
    setCrowdsaleTokenBalance(crowdsaleTokenBalance.value.amount)
  }

  useEffect(() => {
    getProvider()
  }, [])


  return (
    <div className="page">
      <Header provider={provider} user={user} setUser={setUser} />
      <main className="main">
        <div className="hero">
          <h1>Introducing sDAPP</h1>
          <p>Join our community today!</p>
        </div>
      </main >
    </div >
  );
}