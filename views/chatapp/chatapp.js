document.addEventListener('DOMContentLoaded', async () => {
    
    const emojiButton = document.getElementById('emojiButton');
    const emojiPicker = document.getElementById('emojiPicker');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    const token = localStorage.getItem('token');

    let messages = JSON.parse(localStorage.getItem('messages')) || [];  // Set to keep track of displayed message IDs
    let lastMessageId = messages.length > 0 ? messages[messages.length - 1].id:null;

    emojiButton.addEventListener('click', () => {
        if (emojiPicker.style.display === 'none') {
            emojiPicker.style.display = 'block';
        } else {
            emojiPicker.style.display = 'none';
        }
    });

    emojiPicker.addEventListener('emoji-click', (event) => {
        messageInput.value += event.detail.unicode;
        emojiPicker.style.display = 'none';
    });

    document.addEventListener('click', (event) => {
        if (!emojiPicker.contains(event.target) && !emojiButton.contains(event.target)) {
            emojiPicker.style.display = 'none';
        }
    });

    const fetchMessages = async () => {
       try{
         const response = await axios.get('http://localhost:3000/message/view-messages',{
            headers:{"Authorization":token},
            params: {lastMessageId}
        });
         const newMessages = response.data
         console.log(newMessages)
         newMessages.forEach((message) =>{
            messages.push(message);
         })
         if (messages.length > 10) {
            messages = messages.slice(-10);
        }
        localStorage.setItem('messages', JSON.stringify(messages));
        lastMessageId = messages[messages.length - 1].id;
        
        messages.forEach((message) =>{
            newMessage(message);
         })
        }
        catch(err){
         console.log(err);
        }
    }
    // Call fetchMessages when the page loads
    await fetchMessages();

    // Periodically fetch messages every second
    // setInterval(fetchMessages, 1000); for now task Lets make the Chat App real time not adding because sendmessages is inside dom

    sendButton.addEventListener('click', async (event) =>{
        event.preventDefault();
        const message = messageInput.value;
        if(message){
            try{
                const response = await axios.post("http://localhost:3000/message/send-message",{ message: message },{headers:{"Authorization":token}})
                //{ message: message } because req.body.message i am using if we use message i should only use req.body only
                newMessage(response.data);
                // Clear the input field
                messageInput.value = '';
            }
            catch(err){
                console.log(err);
            }
        }
    })
    function newMessage(message){
        const messagesDiv = document.getElementById('messages');
        
        // Append the new message to the message display area
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', 'mb-2', 'p-2', 'bg-light', 'rounded');
        newMessage.textContent = `${message.username}: ${message.message}`;
        messagesDiv.appendChild(newMessage);
    }
});
