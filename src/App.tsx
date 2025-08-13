import './App.css';
import { useToast } from './toastlib';

function Buttons() {
  const toast = useToast();
  return (
    <div className="buttons">
      <button className="btn btn--success" onClick={() => toast.success('Saved!')}>Success</button>
      <button className="btn btn--error"   onClick={() => toast.error('Failed!')}>Error</button>
      <button className="btn btn--warning" onClick={() => toast.warning('Careful…')}>Warning</button>
      <button className="btn btn--info"    onClick={() => toast.info('Heads up')}>Info</button>
      <button
        className="btn btn--info"
        onClick={() => toast.show('Undoable', { action: { label: 'Undo', onClick: () => alert('undo') } })}
      >
        With Action
      </button>
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <h1>Toast Demo</h1>
      <Buttons />
    </div>
  );
}
