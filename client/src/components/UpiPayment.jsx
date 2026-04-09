import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function UpiPayment({ amount, onSuccess, onCancel }) {
  const [upiId, setUpiId] = useState('')
  const [payeeName, setPayeeName] = useState('')
  const [step, setStep] = useState('form') // form | processing | success | failed
  const [sessionToken, setSessionToken] = useState(null)
  const [refId, setRefId] = useState(null)
  const [countdown, setCountdown] = useState(6)
  const pollRef = useRef(null)
  const timerRef = useRef(null)

  const initiatePayment = async () => {
    if (!upiId) return toast.error('Enter UPI ID')
    try {
      const { data } = await api.post('/upi/initiate', {
        amount, payee_upi: upiId, payee_name: payeeName || 'Merchant'
      })
      setSessionToken(data.session_token)
      setStep('processing')
      startPolling(data.session_token)
      startCountdown()
    } catch (err) {
      toast.error('Could not initiate payment')
    }
  }

  const startCountdown = () => {
    let c = 6
    timerRef.current = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) clearInterval(timerRef.current)
    }, 1000)
  }

  const startPolling = (token) => {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/upi/status/${token}`)
        if (data.data.status === 'success') {
          clearInterval(pollRef.current)
          clearInterval(timerRef.current)
          setRefId(data.data.ref_id)
          setStep('success')
        } else if (data.data.status === 'failed') {
          clearInterval(pollRef.current)
          clearInterval(timerRef.current)
          setStep('failed')
        }
      } catch (e) { }
    }, 2000)
  }

  const handleSimulateSuccess = async () => {
    if (!sessionToken) return
    await api.post(`/upi/confirm/${sessionToken}`)
  }

  const handleSimulateFail = async () => {
    if (!sessionToken) return
    await api.post(`/upi/fail/${sessionToken}`)
    clearInterval(pollRef.current)
    clearInterval(timerRef.current)
    setStep('failed')
  }

  useEffect(() => {
    return () => {
      clearInterval(pollRef.current)
      clearInterval(timerRef.current)
    }
  }, [])

  const upiLink = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR`

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }}>

        {/* FORM step */}
        {step === 'form' && (
          <>
            <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
              <div className="modal-title">📱 UPI Payment</div>
              <button className="modal-close" onClick={onCancel} style={{ position: 'absolute', right: 0 }}>✕</button>
            </div>
            <div style={s.amount}>₹{parseFloat(amount).toLocaleString('en-IN')}</div>
            <p style={s.hint}>Enter payee UPI ID to proceed</p>

            <div style={{ textAlign: 'left', marginBottom: 12 }}>
              <div className="form-group">
                <label>UPI ID *</label>
                <input className="input" placeholder="merchant@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Payee Name</label>
                <input className="input" placeholder="Shop / Person name" value={payeeName} onChange={e => setPayeeName(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-primary" onClick={initiatePayment} style={{ flex: 1, justifyContent: 'center' }}>
                Proceed to Pay
              </button>
            </div>
          </>
        )}

        {/* PROCESSING step */}
        {step === 'processing' && (
          <>
            <div style={s.amount}>₹{parseFloat(amount).toLocaleString('en-IN')}</div>
            <div style={s.to}>To: {payeeName || upiId}</div>

            <div style={s.qrWrap}>
              <QRCodeSVG value={upiLink} size={160} level="M" />
            </div>
            <p style={s.scan}>Scan with any UPI app</p>

            <div style={s.countdownWrap}>
              <div style={s.spinner2}></div>
              <span style={{ fontSize: 13, color: 'var(--text3)' }}>
                {countdown > 0 ? `Auto-confirming in ${countdown}s...` : 'Confirming payment...'}
              </span>
            </div>

            <div style={s.simBtns}>
              <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={handleSimulateSuccess}>✓ Simulate Success</button>
              <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={handleSimulateFail}>✕ Simulate Fail</button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Demo: use simulate buttons or wait for auto-confirm</p>
          </>
        )}

        {/* SUCCESS step */}
        {step === 'success' && (
          <>
            <div style={s.successIcon}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0d9068', marginBottom: 6 }}>Payment Successful!</div>
            <div style={s.amount}>₹{parseFloat(amount).toLocaleString('en-IN')}</div>
            <div style={s.to}>To: {payeeName || upiId}</div>
            <div style={s.refBox}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>UPI Reference ID</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500 }}>{refId}</div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
              onClick={() => onSuccess(refId)}>
              Done ✓
            </button>
          </>
        )}

        {/* FAILED step */}
        {step === 'failed' && (
          <>
            <div style={s.successIcon}>❌</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--expense)', marginBottom: 6 }}>Payment Failed</div>
            <p style={s.hint}>The payment could not be processed.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-outline" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setStep('form'); setCountdown(6) }} style={{ flex: 1, justifyContent: 'center' }}>Retry</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  amount: { fontSize: 32, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--primary)', margin: '8px 0' },
  to: { fontSize: 14, color: 'var(--text2)', marginBottom: 16 },
  hint: { fontSize: 13, color: 'var(--text3)', marginBottom: 16 },
  qrWrap: { background: '#fff', padding: 16, borderRadius: 12, display: 'inline-block', border: '1px solid var(--border)', marginBottom: 12 },
  scan: { fontSize: 13, color: 'var(--text3)', marginBottom: 14 },
  countdownWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 },
  spinner2: { width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  simBtns: { display: 'flex', gap: 8, justifyContent: 'center' },
  successIcon: { fontSize: 52, marginBottom: 8 },
  refBox: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', marginTop: 12 },
}
