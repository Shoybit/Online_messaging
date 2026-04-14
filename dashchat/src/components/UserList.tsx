export default function UserList({ users, setCurrentChat }) {
  return (
    <div className="w-1/3 border-r h-full">
      {users.map((u) => (
        <div
          key={u._id}
          onClick={() => setCurrentChat(u)}
          className="p-4 border-b cursor-pointer hover:bg-gray-100"
        >
          {u.name}
        </div>
      ))}
    </div>
  );
}