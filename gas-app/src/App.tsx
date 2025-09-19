import logo from './logo.svg';
import './App.css';

function App() {

  const handleGasControl = () => {
    alert('가스 제어 버튼이 클릭되었습니다!');
  };

  const handleEmergencyStop = () => {
    alert('긴급 정지 버튼이 클릭되었습니다!');
  };

  return (
    <div className="App" style={{ backgroundColor: 'black', minHeight: '100vh' }}>
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>GasApp</h1>
        
        <div className="button-container">
          <button 
            className="gas-button"
            onClick={handleGasControl}
          >
            가스 제어
          </button>
          <button 
            className="emergency-button"
            onClick={handleEmergencyStop}
          >
            긴급 정지
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;