function formatTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBubble({ message = {}, currentUserId }) {
  const { content, senderName, senderId, timestamp } = message;
  const isOwn = senderId === currentUserId;

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-1 px-2`}>
      {!isOwn && senderName && (
        <span className="text-xs text-gray-500 font-medium px-1">{senderName}</span>
      )}
      <div
        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
          isOwn
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {content}
      </div>
      {timestamp && (
        <span className="text-xs text-gray-400 px-1">{formatTime(timestamp)}</span>
      )}
    </div>
  );
}
