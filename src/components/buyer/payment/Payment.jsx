import { usePayOS } from "@payos/payos-checkout";
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createEmbeddedPaymentLink, cancelPaymentLink } from "../../../services/WalletService";
import "./Payment.css";

export default function Payment() {
    const navigate = useNavigate();
    const [productIds, setProductIds] = useState([]);
    const STORAGE_KEY = 'payos-session';
    const [orderCode, setOrderCode] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 5 phút = 300 giây
    const [isExpired, setIsExpired] = useState(false);
    const timerRef = useRef(null);
    const expiredHandledRef = useRef(false);
  
    const [payOSConfig, setPayOSConfig] = useState({
      RETURN_URL: window.location.href, // required
      ELEMENT_ID: "embedded-payment-container", // required
      CHECKOUT_URL: null, // required
      embedded: true, // Nếu dùng giao diện nhúng
      onSuccess: (event) => {
        //TODO: Hành động sau khi người dùng thanh toán đơn hàng thành công
        
        setIsOpen(false);
        setMessage("Thanh toán thành công");
        setMessageType("success");
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
      },
    });
  
    const { open, exit } = usePayOS(payOSConfig);
  
    const handleGetPaymentLink = async () => {
      setIsCreatingLink(true);
      try {
      const response = await createEmbeddedPaymentLink();
      const result = response.data;
        setOrderCode(result.orderCode);
      setPayOSConfig((oldConfig) => ({
        ...oldConfig,
        CHECKOUT_URL: result.checkoutUrl,
      }));
        setProductIds(result.productIds);
      setIsOpen(true);
        // Lưu session để tránh reset khi refresh
        const now = Date.now();
        const expiresAt = now + 5 * 60 * 1000;
        try {
          sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ orderCode: result.orderCode, checkoutUrl: result.checkoutUrl, expiresAt })
          );
        } catch {}
        setTimeRemaining(5 * 60); // Reset về 5 phút khi tạo link mới
        setIsExpired(false);
      } catch (error) {
        console.error("Error creating payment link:", error);
        setMessage("Có lỗi xảy ra khi tạo link thanh toán");
        setMessageType("error");
      } finally {
      setIsCreatingLink(false);
      }
    };

    const handleCancelPayment = async () => {
      // Hủy và quay về trang checkout
      try {
        setIsCancelling(true);
        try { exit && exit(); } catch {}
        if (orderCode) {
          await cancelPaymentLink(orderCode);
        }
      } catch (e) {
        // ignore
      } finally {
        try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
        setIsCancelling(false);
        navigate('/buyer/checkout');
      }
    };

    // Đếm ngược thời gian
    useEffect(() => {
      if (isOpen && !isExpired) {
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              setIsExpired(true);
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [isOpen, isExpired]);

    // Khi hết hạn tự động hủy và quay lại trang checkout
    useEffect(() => {
      if (isExpired && !expiredHandledRef.current) {
        expiredHandledRef.current = true;
        (async () => {
          try {
            try { exit && exit(); } catch {}
            if (orderCode) {
              await cancelPaymentLink(orderCode);
            }
          } catch (e) {
            // ignore
          } finally {
            try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
            navigate('/buyer/checkout');
          }
        })();
      }
    }, [isExpired, orderCode]);

    // Format thời gian: MM:SS
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
      // Thử khôi phục session nếu còn hạn
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          const now = Date.now();
          if (data?.expiresAt && data.expiresAt > now && data?.checkoutUrl && data?.orderCode) {
            setOrderCode(data.orderCode);
            setPayOSConfig((old) => ({ ...old, CHECKOUT_URL: data.checkoutUrl }));
            setIsOpen(true);
            const remain = Math.max(0, Math.floor((data.expiresAt - now) / 1000));
            setTimeRemaining(remain);
            setIsExpired(false);
            return; // Không tạo link mới
          } else {
            sessionStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {}
      handleGetPaymentLink();
    }, []);
  
    useEffect(() => {
      if (payOSConfig.CHECKOUT_URL != null) {
        open();
      }
    }, [payOSConfig]);
    
    return message ? (
      <Message message={message} type={messageType} />
    ) : (
      <div className="payment-container">
        <div className="payment-wrapper">
          <div className="payment-header">
            <h2 className="payment-title">Thanh toán</h2>
            {isOpen && !isExpired && (
              <div className="timer-container">
                <div className="timer-icon">⏱️</div>
                <div className="timer-text">
                  <span className="timer-label">Thời gian còn lại:</span>
                  <span className={`timer-countdown ${timeRemaining <= 60 ? "timer-warning" : ""}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
            </div>
            )}
            {isExpired && (
              <div className="timer-expired">
                Link thanh toán đã hết hạn
                    </div>
                  )}
                </div>

          {isCreatingLink && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Đang tạo link thanh toán...</p>
            </div>
          )}

          {isOpen && !isExpired && (
            <div className="payment-info">
              <div className="info-box">
                <p className="info-text">
                  Sau khi thực hiện thanh toán thành công, vui lòng đợi từ 5 - 10 giây để
                  hệ thống tự động cập nhật.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  className="retry-button"
                  onClick={handleCancelPayment}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Đang hủy...' : 'Hủy thanh toán'}
                </button>
            </div>
            </div>
          )}


          <div
            id="embedded-payment-container"
            className="payment-embed-container"
          ></div>
        </div>
      </div>
    );
  };
  
  const Message = ({ message, type = "success" }) => (
    <div className="payment-container">
      <div className="payment-wrapper">
        {type === "success" ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p className="success-text">{message}</p>
            <a href="/" className="back-button">Quay lại trang chủ</a>
          </div>
        ) : (
          <div className="error-message">
            <div className="error-icon">✕</div>
            <p className="error-text">{message}</p>
            <a href="/" className="back-button">Quay lại trang chủ</a>
        </div>
        )}
      </div>
    </div>
  );
  