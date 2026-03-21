import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import LuteConnect from 'lute-connect';

// ── Contract config ──────────────────────────────────────────────────
const VAULT_APP_ID = 757485914; // Deployed on Algorand testnet
const USDC_ASA_ID = 10458941; // USDC on Algorand testnet
const USDC_DECIMALS = 6;
const ALGO_DECIMALS = 6;

const ALGOD_URL = 'https://testnet-api.algonode.cloud';
const ALGOD_TOKEN = '';

// Token options
type TokenType = 'ALGO' | 'USDC';

// Shared Lute instance for signing
const luteClient = new LuteConnect('FundMySkill');
luteClient.forceWeb = true;

// LocalStorage key for persisting Lute address
const LUTE_ADDRESS_KEY = 'fundmyskill_lute_address';

function getAlgodClient() {
  return new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, '');
}

function getAppAddress(): string {
  return algosdk.getApplicationAddress(VAULT_APP_ID).toString();
}

// Helper: Uint8Array to base64
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: base64 to Uint8Array
function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function DonationPage() {
  // ── Wallet state ───────────────────────────────────────────────────
  const { wallets, activeAddress: useWalletAddress, transactionSigner: useWalletSigner, activeWallet } = useWallet();

  // Lute direct connection state (fallback when extension doesn't work)
  const [luteAddress, setLuteAddress] = useState<string | null>(() => {
    // Restore from localStorage on initial load
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LUTE_ADDRESS_KEY);
    }
    return null;
  });
  const connectingRef = useRef(false);

  // Persist luteAddress to localStorage
  useEffect(() => {
    if (luteAddress) {
      localStorage.setItem(LUTE_ADDRESS_KEY, luteAddress);
    } else {
      localStorage.removeItem(LUTE_ADDRESS_KEY);
    }
  }, [luteAddress]);

  // Use either use-wallet address or direct lute address
  const activeAddress = useWalletAddress || luteAddress;

  // ── UI state ───────────────────────────────────────────────────────
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenType>('ALGO');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [fiatAmount, setFiatAmount] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [txId, setTxId] = useState('');
  const [txError, setTxError] = useState('');
  const [vaultBalance, setVaultBalance] = useState<string | null>(null);

  // Exchange rates (USDC pegged 1:1 to USD, ALGO approximate rate)
  const rates: Record<string, number> = { USD: 1, INR: 83.5 };
  const algoUsdRate = 0.35; // Approximate ALGO/USD rate

  // ── Fiat → Crypto conversion ───────────────────────────────────────
  useEffect(() => {
    if (fiatAmount === '') {
      setCryptoAmount('');
      return;
    }
    const num = parseFloat(fiatAmount);
    if (!isNaN(num) && num >= 0) {
      const usdValue = num / (rates[fiatCurrency] || 1);
      if (selectedToken === 'USDC') {
        setCryptoAmount(usdValue.toFixed(4));
      } else {
        // Convert USD to ALGO
        const algoAmount = usdValue / algoUsdRate;
        setCryptoAmount(algoAmount.toFixed(4));
      }
    } else {
      setCryptoAmount('');
    }
  }, [fiatAmount, fiatCurrency, selectedToken]);

  // ── Fetch vault USDC balance ───────────────────────────────────────
  const fetchVaultBalance = useCallback(async () => {
    try {
      const client = getAlgodClient();
      const appAddr = getAppAddress();
      const info = await client.accountInformation(appAddr).do();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assets = (info as any).assets ?? (info as any)['assets'] ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assetHolding = assets.find((a: any) => {
        const id = a['asset-id'] ?? a['assetId'] ?? a.assetId;
        return Number(id) === USDC_ASA_ID;
      });
      if (assetHolding) {
        const rawAmount = Number(assetHolding.amount ?? assetHolding['amount'] ?? 0);
        const balance = rawAmount / Math.pow(10, USDC_DECIMALS);
        setVaultBalance(balance.toFixed(2));
      } else {
        setVaultBalance('0.00');
      }
    } catch {
      setVaultBalance(null);
    }
  }, []);

  useEffect(() => {
    fetchVaultBalance();
    const interval = setInterval(fetchVaultBalance, 15000);
    return () => clearInterval(interval);
  }, [fetchVaultBalance]);

  // ── Wallet connect ─────────────────────────────────────────────────
  const handleConnect = async (walletId: string) => {
    // Prevent double execution from React StrictMode
    if (connectingRef.current) return;
    connectingRef.current = true;

    const wallet = wallets.find((w) => w.id === walletId);

    if (walletId === 'lute') {
      // Use direct lute-connect with web popup (extension has issues)
      try {
        const accounts = await luteClient.connect('testnet-v1.0');
        if (accounts && accounts.length > 0) {
          setLuteAddress(accounts[0]);
          setShowWalletModal(false);
        }
      } catch (err) {
        console.error('Lute connect error:', err);
        setTxError(`Failed to connect Lute: ${err instanceof Error ? err.message : String(err)}`);
        setTxStatus('error');
        setShowWalletModal(false);
      } finally {
        connectingRef.current = false;
      }
      return;
    }

    // For other wallets (Pera), use use-wallet
    if (wallet) {
      try {
        await wallet.connect();
        setShowWalletModal(false);
      } catch (err) {
        console.error('Wallet connect error:', err);
        setTxError(`Failed to connect ${wallet.metadata.name}: ${err instanceof Error ? err.message : String(err)}`);
        setTxStatus('error');
        setShowWalletModal(false);
      }
    }
    connectingRef.current = false;
  };

  const handleDisconnect = async () => {
    if (activeWallet) {
      await activeWallet.disconnect();
    }
    // Clear direct Lute connection
    setLuteAddress(null);
  };

  // ── Donation transaction ───────────────────────────────────────────
  const handleDonate = async () => {
    if (!activeAddress) {
      setTxError('Please connect your wallet first');
      setTxStatus('error');
      return;
    }

    // Check if we have a way to sign (either use-wallet or direct Lute)
    const isDirectLute = !!luteAddress;
    if (!isDirectLute && !useWalletSigner) {
      setTxError('Please connect your wallet first');
      setTxStatus('error');
      return;
    }

    const donationAmount = parseFloat(cryptoAmount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setTxError('Enter a valid donation amount');
      setTxStatus('error');
      return;
    }

    setTxStatus('pending');
    setTxError('');
    setTxId('');

    try {
      const client = getAlgodClient();
      const params = await client.getTransactionParams().do();
      const appAddr = getAppAddress();

      let signedTxns: Uint8Array[];

      if (selectedToken === 'ALGO') {
        // Simple ALGO payment transaction
        const microAlgos = Math.floor(donationAmount * Math.pow(10, ALGO_DECIMALS));

        const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAddress,
          receiver: appAddr,
          amount: microAlgos,
          suggestedParams: params,
        });

        if (isDirectLute) {
          // Sign with Lute - use WalletTransaction format (ARC-0001)
          const txnB64 = uint8ArrayToBase64(paymentTxn.toByte());
          const walletTxns = [{ txn: txnB64 }];
          console.log('Sending to Lute:', walletTxns);
          const signedResult = await luteClient.signTxns(walletTxns);
          console.log('Lute response:', signedResult);
          // Handle response
          signedTxns = signedResult.map((item: string | { blob: string } | Uint8Array | null) => {
            if (item === null) {
              throw new Error('Transaction was not signed');
            }
            if (item instanceof Uint8Array) {
              return item;
            } else if (typeof item === 'string') {
              return base64ToUint8Array(item);
            } else if (item && typeof item === 'object' && 'blob' in item) {
              return base64ToUint8Array(item.blob);
            }
            throw new Error('Unexpected signed transaction format');
          });
        } else {
          // Sign with use-wallet
          signedTxns = await useWalletSigner!(
            [paymentTxn],
            [0]
          );
        }
      } else {
        // USDC donation with app call
        const microAmount = Math.floor(donationAmount * Math.pow(10, USDC_DECIMALS));

        // Transaction 1: ASA transfer (USDC → contract)
        const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: activeAddress,
          receiver: appAddr,
          amount: microAmount,
          assetIndex: USDC_ASA_ID,
          suggestedParams: params,
        });

        // Transaction 2: App call (deposit_donation)
        const depositSelector = new Uint8Array(
          algosdk.ABIMethod.fromSignature('deposit_donation(axfer)void').getSelector()
        );

        const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          sender: activeAddress,
          appIndex: VAULT_APP_ID,
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          appArgs: [depositSelector],
          foreignAssets: [USDC_ASA_ID],
          suggestedParams: params,
        });

        // Group them atomically
        algosdk.assignGroupID([assetTransferTxn, appCallTxn]);

        if (isDirectLute) {
          // Sign with Lute - use WalletTransaction format (ARC-0001)
          const walletTxns = [assetTransferTxn, appCallTxn].map(txn => ({
            txn: uint8ArrayToBase64(txn.toByte())
          }));
          console.log('Sending to Lute:', walletTxns);
          const signedResult = await luteClient.signTxns(walletTxns);
          console.log('Lute response:', signedResult);
          // Handle response
          signedTxns = signedResult.map((item: string | { blob: string } | Uint8Array | null) => {
            if (item === null) {
              throw new Error('Transaction was not signed');
            }
            if (item instanceof Uint8Array) {
              return item;
            } else if (typeof item === 'string') {
              return base64ToUint8Array(item);
            } else if (item && typeof item === 'object' && 'blob' in item) {
              return base64ToUint8Array(item.blob);
            }
            throw new Error('Unexpected signed transaction format');
          });
        } else {
          // Sign with use-wallet
          const encodedTxns = [assetTransferTxn, appCallTxn].map((txn) => txn.toByte());
          signedTxns = await useWalletSigner!(
            encodedTxns.map((t) => algosdk.decodeUnsignedTransaction(t)),
            [0, 1]
          );
        }
      }

      // Submit
      const { txid } = await client.sendRawTransaction(signedTxns).do();
      await algosdk.waitForConfirmation(client, txid, 4);

      setTxId(txid);
      setTxStatus('success');
      setFiatAmount('');
      fetchVaultBalance();
    } catch (err: unknown) {
      console.error('Donation error:', err);
      const message = err instanceof Error ? err.message : String(err);
      // Make user-friendly error messages
      if (message.includes('User') || message.includes('rejected') || message.includes('cancelled') || message.includes('Rejected')) {
        setTxError('Transaction was cancelled in your wallet.');
      } else if (message.includes('underflow') || message.includes('below min')) {
        setTxError(`Insufficient ${selectedToken} balance in your wallet.`);
      } else {
        setTxError(message.length > 120 ? message.slice(0, 120) + '...' : message);
      }
      setTxStatus('error');
    }
  };

  const shortAddr = activeAddress
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
    : '';

  const canDonate = !!activeAddress && !!parseFloat(cryptoAmount) && txStatus !== 'pending';

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm dark:shadow-none h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">FundMySkill</Link>
        </div>
        <div className="flex items-center gap-4">
          {activeAddress ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold border border-green-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                {shortAddr}
              </span>
              <button
                onClick={handleDisconnect}
                className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Disconnect wallet"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowWalletModal(true)}
              className="px-4 py-2 rounded-full font-semibold text-sm bg-primary text-on-primary hover:bg-primary/90 hover:shadow-md transition-all shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* ── Wallet Modal ───────────────────────────────────────────── */}
      {showWalletModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-headline font-bold text-lg text-on-surface">Connect Wallet</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="p-4 space-y-2">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  {wallet.metadata.icon && (
                    <img
                      src={wallet.metadata.icon}
                      alt={wallet.metadata.name}
                      className="w-8 h-8 rounded-lg"
                    />
                  )}
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">
                      {wallet.metadata.name}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 text-center">
              <p className="text-xs text-on-surface-variant">
                Connecting to <strong className="text-primary">Algorand Testnet</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-lg bg-surface-container-lowest p-8 rounded-[2rem] shadow-2xl shadow-primary/10 border border-outline-variant/20 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

          {/* Header */}
          <div className="mb-8 text-center relative z-10">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">Support FundMySkill</h1>
            <p className="text-on-surface-variant text-sm">Empower AI-assisted learning with a crypto donation.</p>
          </div>

          <form className="space-y-6 relative z-10" onSubmit={e => e.preventDefault()}>

            {/* Network & Token Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">Network</label>
                <div className="h-12 px-4 flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low font-medium text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Algorand Testnet
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">Token</label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value as TokenType)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-low font-medium text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                  <option value="ALGO">ALGO</option>
                  <option value="USDC">USDC (ASA)</option>
                </select>
              </div>
            </div>

            <div className="h-px bg-outline-variant/30 my-4" />

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
                Donation Amount
              </label>
              <div className="flex gap-4 items-start">
                {/* Fiat Input */}
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-3 text-outline font-bold">
                    {fiatCurrency === 'USD' ? '$' : '\u20B9'}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={fiatAmount}
                    onChange={(e) => setFiatAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-12 pl-8 pr-16 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-bold text-lg text-on-surface"
                  />
                  <div className="absolute right-1 top-1">
                    <select
                      value={fiatCurrency}
                      onChange={(e) => setFiatCurrency(e.target.value)}
                      className="h-10 px-2 bg-transparent border-none text-sm font-semibold text-on-surface-variant focus:ring-0 cursor-pointer outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col justify-center h-12">
                  <span className="material-symbols-outlined text-outline">sync_alt</span>
                </div>

                {/* Crypto Amount */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    readOnly
                    value={cryptoAmount}
                    placeholder="0.00"
                    className="w-full h-12 px-4 pr-16 rounded-xl border border-transparent bg-surface-container-high text-on-surface font-bold text-lg flex items-center cursor-not-allowed opacity-90"
                  />
                  <div className="absolute right-4 top-3 text-sm font-semibold text-primary">
                    {selectedToken}
                  </div>
                </div>
              </div>
              {selectedToken === 'ALGO' && (
                <p className="text-xs text-on-surface-variant mt-2">
                  Rate: 1 ALGO ≈ ${algoUsdRate.toFixed(2)} USD (approximate)
                </p>
              )}
            </div>

            {/* Donate Button */}
            <button
              onClick={handleDonate}
              disabled={!canDonate}
              className="mt-6 w-full h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {txStatus === 'pending' ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing & Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    volunteer_activism
                  </span>
                  Donate {selectedToken}
                </>
              )}
            </button>

            {/* Status Messages */}
            {txStatus === 'success' && (
              <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <strong>Donation successful!</strong>
                </div>
                <p className="text-xs text-green-700 mt-1 break-all">
                  Tx:{' '}
                  <a
                    href={`https://lora.algokit.io/testnet/transaction/${txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-900"
                  >
                    {txId.slice(0, 12)}...{txId.slice(-8)}
                  </a>
                </p>
              </div>
            )}
            {txStatus === 'error' && txError && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">error</span>
                  <span>{txError}</span>
                </div>
              </div>
            )}

            {/* Info box */}
            {!activeAddress && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-500 mt-0.5 text-sm">info</span>
                  <div>
                    <strong>Connect Wallet to Donate</strong>
                    <p className="text-xs text-blue-600 mt-1">
                      Your donation goes directly to a transparent on-chain vault.
                      Funds are used to pay for AI tutoring costs and course content.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
