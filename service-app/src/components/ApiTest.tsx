import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  inputGroup: {
    marginBottom: '20px',
    width: '100%',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    minHeight: '100px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '20px',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    color: '#c62828',
  },
  responseBox: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    whiteSpace: 'pre-wrap',
  },
};

function ApiTest() {
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testClaudeAPI = async () => {
    setLoading(true);
    setError('');
    setResponse('');
    
    try {
      const result = await axios.post(
        '/v1/messages',
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: message }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        }
      );
      
      setResponse(result.data.content[0].text);
    } catch (err: any) {
      console.error('Error calling Claude API:', err);
      setError(err.response?.data?.error?.message || err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Claude API 테스트</h1>
      
      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor="api-key">API 키</label>
        <input 
          id="api-key"
          type="password" 
          style={styles.input}
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-api03-..."
        />
      </div>
      
      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor="message">메시지</label>
        <textarea
          id="message"
          style={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="질문을 입력해주세요..."
          rows={4}
        />
      </div>
      
      <button 
        onClick={testClaudeAPI}
        disabled={!apiKey || !message || loading}
        style={{
          ...styles.button,
          ...((!apiKey || !message || loading) && styles.buttonDisabled)
        }}
      >
        {loading ? '응답 대기 중...' : '질문하기'}
      </button>
      
      {error && (
        <div style={styles.errorBox}>
          <h3 style={{ margin: '0 0 10px 0' }}>오류 발생</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}
      
      {response && (
        <div style={styles.responseBox}>
          <h3 style={{ margin: '0 0 10px 0' }}>Claude 응답</h3>
          <p style={{ margin: 0 }}>{response}</p>
        </div>
      )}
    </div>
  );
}

export default ApiTest;