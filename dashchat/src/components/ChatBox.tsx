export default function ChatBox({ messages }) {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((m, i) => (
        <div key={i}>
          <b>{m.name}:</b> {m.text}
        </div>
      ))}
    </div>
  );
}