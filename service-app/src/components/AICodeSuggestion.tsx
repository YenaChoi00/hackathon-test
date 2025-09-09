import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    fontWeight: 'bold' as const,
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
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
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
    whiteSpace: 'pre-wrap' as const,
  },
};

const AICodeSuggestion: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    console.log(result);
  }, [result]);

  // Claude API 호출 함수
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

  // GitHub PR 생성 함수
  const createPullRequest = async (fileChanges: {
    path: string;
    content: string;
    lineStart?: number;
    lineEnd?: number;
  }) => {
    try {
      const response = await fetch('https://api.github.com/repos/OWNER/REPO/pulls', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '코드 변경 제안',
          body: `
## 변경 제안 내용
파일: ${fileChanges.path}
${fileChanges.lineStart ? `라인: ${fileChanges.lineStart}-${fileChanges.lineEnd}` : ''}

\`\`\`typescript
${fileChanges.content}
\`\`\`
`,
          head: 'feature/code-suggestion',
          base: 'main'
        })
      });

      if (!response.ok) {
        throw new Error('PR 생성 실패');
      }

      const data = await response.json();
      setResult(`PR이 생성되었습니다: ${data.html_url}`);
    } catch (error) {
      console.error('PR 생성 중 오류:', error);
      setResult('PR 생성 중 오류가 발생했습니다.');
    }
  };

  // iframe과 통신하는 함수
  const sendMessageToIframe = (type: string, payload: any) => {
    const iframe = document.querySelector('.gas-app-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type, payload }, '*');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>코드 변경 제안</h1>
      
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
          placeholder="변경하고 싶은 내용을 자연어로 설명해주세요..."
          rows={4}
        />
      </div>
      
      <div style={styles.buttonGroup}>
        <button 
          onClick={testClaudeAPI}
          disabled={!apiKey || !message || loading}
          style={{
            ...styles.button,
            ...((!apiKey || !message || loading) && styles.buttonDisabled)
          }}
        >
          {loading ? '분석 중...' : 'AI에게 물어보기'}
        </button>

        <button 
          onClick={() => {
            if (response) {
              // GitHub PR 생성을 위한 정보 추출 시도
              const prMatch = response.match(/```typescript\n([\s\S]*?)```/);
              if (prMatch) {
                createPullRequest({
                  path: 'src/App.tsx', // 기본 파일 경로
                  content: prMatch[1].trim()
                });
              }
            }
            
            // iframe에 메시지 전송
            sendMessageToIframe('CHANGE_TEXT', {
              text: response || message
            });
          }}
          style={{
            ...styles.button,
            backgroundColor: '#2196F3',
          }}
          disabled={!response && !message}
        >
          변경사항 적용
        </button>
      </div>
      
      {error && (
        <div style={styles.errorBox}>
          <h3 style={{ margin: '0 0 10px 0' }}>오류 발생</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}
      
      {response && (
        <div style={styles.responseBox}>
          <h3 style={{ margin: '0 0 10px 0' }}>AI 응답</h3>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{response}</p>
        </div>
      )}
    </div>
  );
};

export default AICodeSuggestion;
