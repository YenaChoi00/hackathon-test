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
  const [caludeApiKey, setCaludeApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    console.log(result);
  }, [result]);

  // GitHub API를 통해 파일 읽기
  const readFileFromGitHub = async (path: string) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/contents/${path}`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.raw'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API 오류: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('GitHub 파일 읽기 오류:', error);
      throw error;
    }
  };

  // 현재 브랜치 가져오기
  const getCurrentBranch = async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/git/refs/heads/main`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error('브랜치 정보를 가져올 수 없습니다.');
      }

      const data = await response.json();
      return data.object.sha;
    } catch (error) {
      console.error('브랜치 정보 가져오기 오류:', error);
      throw error;
    }
  };

  // Claude API 호출 함수
  const askClaudeAPI = async () => {
    setLoading(true);
    setError('');
    setResponse('');
    
    try {
      const currentCode = await readFileFromGitHub('gas-app/src/App.tsx');
      const prompt = `현재 gas-app/src/App.tsx 파일의 코드입니다:

\`\`\`typescript
${currentCode}
\`\`\`

요청사항: ${message}

응답은 다음 형식으로 해주세요:
1. 질문에 대한 설명 또는 요청에 따른 변경사항 설명
2. 전체 변경된 코드를 \`\`\`typescript\n...\`\`\` 블록으로 제공`;

      const result = await axios.post(
        '/v1/messages',
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': caludeApiKey,
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
      // const baseBranch = await getCurrentBranch();
      const newBranchName = 'feature/code-suggestion';
      
      // 1. 새 브랜치 생성
      // await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/git/refs`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ref: `refs/heads/${newBranchName}`,
      //     sha: baseBranch
      //   })
      // });

      // 2. 현재 파일 내용 가져오기 (PR 설명용)
      const currentFile = await readFileFromGitHub(fileChanges.path);

      // 3. main의 최신 커밋 가져오기
      const mainRef = await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/git/refs/heads/main`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`
        }
      }).then(res => res.json());

      // 4. 새 트리 생성
      const treeResponse = await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/git/trees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_tree: mainRef.object.sha,
          tree: [{
            path: fileChanges.path,
            mode: '100644',
            type: 'blob',
            content: fileChanges.content
          }]
        })
      }).then(res => res.json());

      // 5. 새 커밋 생성
      const commitResponse = await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/git/commits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '코드 변경 제안',
          tree: treeResponse.sha,
          parents: [mainRef.object.sha]
        })
      }).then(res => res.json());

      // 6. 브랜치의 현재 커밋 가져오기
      const branchResponse = await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/git/refs/heads/${newBranchName}`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`
        }
      }).then(res => res.json());

      // 7. 새 커밋 생성 (이전 커밋을 부모로 설정)
      const newCommitResponse = await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/git/commits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '코드 변경 제안',
          tree: treeResponse.sha,
          parents: [branchResponse.object.sha]  // 현재 브랜치의 커밋을 부모로 설정
        })
      }).then(res => res.json());

      // 8. 브랜치 업데이트 (force 없이)
      const updateBranchResponse = await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/git/refs/heads/${newBranchName}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sha: newCommitResponse.sha
        })
      });

      if (!updateBranchResponse.ok) {
        throw new Error('브랜치 업데이트 실패: ' + await updateBranchResponse.text());
      }

      // 9. PR 설명 업데이트
      const prsResponse = await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/pulls?head=${process.env.REACT_APP_GITHUB_OWNER}:${newBranchName}&state=open`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`
        }
      }).then(res => res.json());

      if (prsResponse.length > 0) {
        const prNumber = prsResponse[0].number;
        await fetch(`https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/pulls/${prNumber}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: `## 최근 변경 제안 내용
파일: ${fileChanges.path}

### 변경 전
\`\`\`typescript
${currentFile}
\`\`\`

### 변경 후
\`\`\`typescript
${fileChanges.content}
\`\`\`
`
          })
        });
      }

      setResult(`새로운 커밋이 feature/code-suggestion 브랜치에 추가되었습니다.
변경된 파일: ${fileChanges.path}

[변경 전]
${currentFile}

[변경 후]
${fileChanges.content}`);
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
          value={caludeApiKey} 
          onChange={(e) => setCaludeApiKey(e.target.value)}
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
          onClick={askClaudeAPI}
          disabled={!caludeApiKey || !message || loading}
          style={{
            ...styles.button,
            ...((!caludeApiKey || !message || loading) && styles.buttonDisabled)
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
                  path: 'gas-app/src/App.tsx', // 임시 고정
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

      {/* GitHub API 테스트 섹션 */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>GitHub API 테스트</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={async () => {
              console.log('GitHub API 테스트 시작');
              try {
                setLoading(true);
                const code = await readFileFromGitHub('gas-app/src/App.tsx');
                setResult(`파일 읽기 성공!\n\n=== gas-app/src/App.tsx ===\n${code}`);
              } catch (error) {
                setError('GitHub API 테스트 실패: ' + (error as Error).message);
              } finally {
                setLoading(false);
              }
            }}
            style={{
              ...styles.button,
              backgroundColor: '#6f42c1'
            }}
            disabled={loading}
          >
            {loading ? '파일 읽는 중...' : 'GitHub 파일 읽기 테스트'}
          </button>

          <button
            onClick={async () => {
              console.log('GitHub PR 테스트 시작');
              try {
                setLoading(true);
                const prMatch = response.match(/```typescript\n([\s\S]*?)```/);
                if (prMatch) {
                  await createPullRequest({
                    path: 'gas-app/src/App.tsx',
                    content: prMatch[1].trim(),
                  });
                } else {
                  setError('AI 응답에서 코드 블록을 찾을 수 없습니다.');
                }
              } catch (error) {
                setError('GitHub PR 테스트 실패: ' + (error as Error).message);
              } finally {
                setLoading(false);
              }
            }}
            style={{
              ...styles.button,
              backgroundColor: '#28a745'
            }}
            disabled={loading}
          >
            {loading ? 'PR 생성 중...' : 'GitHub PR 생성 테스트'}
          </button>
        </div>

        {result && (
          <div style={{
            ...styles.responseBox,
            backgroundColor: '#f0fff4',
            border: '1px solid #68d391'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>GitHub API 테스트 결과</h3>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICodeSuggestion;
