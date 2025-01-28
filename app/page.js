"use client"
import { useEffect, useState } from "react"
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddressSync } from "@solana/spl-token"
import { AnchorProvider, Program } from "@coral-xyz/anchor"

// Import config & IDL
/* import config from "@/app/config.json"
import Crowdsale from "@/app/idl/crowdsale.json" */

// Import components
import Header from "./components/Header"

export default function Home() {
  const [provider, setProvider] = useState(null)
  const [AnchorProvider, setAnchorProvider] = useState(null)
  const [user, setUser] = useState(null)

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

          // Get Crowdsale Program

          // Fetch Crowdsale State

          // Fetch Balanace
          await getUserBalance(anchorProvider)
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

    const userBalance = await anchorProvider.connection.getBalance(userPublicKey)
    setUserBalance(userBalance)
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