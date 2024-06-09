const socket = io('http://localhost:3000');

document.addEventListener('DOMContentLoaded', async () => {
    
    const emojiButton = document.getElementById('emojiButton');
    const emojiPicker = document.getElementById('emojiPicker');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const groupList = document.getElementById('groupList');
    const createGroupButton = document.getElementById('createGroupButton');
    const messagesDiv = document.getElementById('messages');
    const usersDiv = document.getElementById('users');
    const groupNameDisplay = document.getElementById('groupNameDisplay');
    const fileInput = document.getElementById('fileInput');
    const fileInputButton = document.getElementById('fileInputButton');
    const inviteModal = new bootstrap.Modal(document.getElementById('inviteModal'));
       
    const token = localStorage.getItem('token');
    
    let displayedMessageIds = new Set();  // Set to keep track of displayed message IDs

    let currentGroupId = null;
    let messages = [];  
    let lastMessageId = null;


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

    fileInputButton.addEventListener('click', () => {
        fileInput.click(); // Trigger click on file input when the button is clicked
    });

    fileInput.addEventListener('change', handleFileSelection);

    function handleFileSelection(event) {
        const file = event.target.files[0]; // Get the selected file
        // For example, you can display the file name
        console.log('Selected file:', file);
    }

    const fetchGroups = async () => {
        try {
            const response = await axios.get('http://localhost:3000/group/my-groups', {
                headers: { "Authorization": token }
            });
            const groups = response.data;
            groupList.innerHTML = '';
            groups.forEach(group => {
                // console.log(group.group.name)
                const groupItem = document.createElement('li');
                groupItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                
                const groupName = document.createElement('span');
                groupName.textContent = group.group.name;
                groupItem.appendChild(groupName);

                const inviteButton = document.createElement('button');
                inviteButton.textContent = 'Invite';
                inviteButton.classList.add('btn', 'btn-primary');
                inviteButton.addEventListener('click', () => {
                    openInviteModal(group.group.id);
                });
                groupItem.appendChild(inviteButton);

                groupItem.addEventListener('click', async () => {
                    console.log("clicked non global group")
                    await switchGroup(group.group.id);
                    inviteModal.hide(); 
                    // Update the group name display in the navbar
                    groupNameDisplay.textContent = group.group.name;
                });
                groupList.appendChild(groupItem);
            });

            // Add Global Group
            const globalGroupItem = document.createElement('li');
            globalGroupItem.classList.add('list-group-item');
            globalGroupItem.textContent = 'Global';
            globalGroupItem.addEventListener('click', async () => {
                console.log("clicked global group")
                await switchGroup(null)
                currentGroupId = null; // Update the current group ID
                inviteModal.hide();
                // Update the group name display in the navbar
                groupNameDisplay.textContent = 'Global';
            });
            groupList.appendChild(globalGroupItem);

        } catch (err) {
            console.log(err);
        }
    };

    const openInviteModal = (groupId) => {
        // Open the invitation modal
        currentGroupId = groupId;
        inviteModal.show();
    };

    const fetchMessages = async () => {
       try{
        // console.log(currentGroupId)
         const response = await axios.get(currentGroupId ? `http://localhost:3000/group-message/messages/${currentGroupId}` : 'http://localhost:3000/message/view-messages',{
            headers:{"Authorization":token},
            params: {lastMessageId}
        });
         const newMessages = response.data
        //  console.log(newMessages)

         if (newMessages.length > 0) {
            lastMessageId = newMessages[newMessages.length - 1].id;
        }
        
        newMessages.forEach(message => {
            if (!displayedMessageIds.has(message.id)) {
                displayedMessageIds.add(message.id);
                messages.push(message);
            }
        });

        messages.sort((a, b) => a.id - b.id);

        // console.log(messages)
        if (messages.length > 10) {
            messages = messages.slice(-10);
            displayedMessageIds = new Set(messages.map(msg => msg.id));
        }

        localStorage.setItem(currentGroupId ? `groupMessages-${currentGroupId}` : 'globalMessages', JSON.stringify(messages));
        // console.log(messages[messages.length - 1].id)
      
        
        }
        catch(err){
         console.log(err);
        }
    }
    
    const fetchUsers = async () => {
        try {
            const response = await axios.get(currentGroupId ? `http://localhost:3000/group/${currentGroupId}/members` : 'http://localhost:3000/user/all-users', {
                headers: { "Authorization": token }
            });
            const users = response.data;
            usersDiv.innerHTML = '';
            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.classList.add('user');
                userItem.textContent = user.name;
                usersDiv.appendChild(userItem);
            });
        } catch (err) {
            console.log(err);
        }
    };
    
    const sendInvitations = async (groupId) => {
        const invitationEmails = document.getElementById('invitationEmails').value;

        try {
            const response = await axios.post('http://localhost:3000/group/invite', {
                groupId: groupId, // Use the current group ID
                emails: invitationEmails.split(',').map(email => email.trim())
            }, {
                headers: { "Authorization": token }
            });
            
            console.log(response.data); // Handle success response
            invitationEmails.value = ''; // Clear the input field
            inviteModal.hide(); // Close the invitation modal
        } catch (err) {
            console.log(err); // Handle error
        }
        
        inviteModal.hide();
    };
      
    document.getElementById('sendInvitations').addEventListener('click', () => {
        sendInvitations(currentGroupId);
    });

    const switchGroup = async (groupId) => {
        currentGroupId = groupId;
        lastMessageId = null;// Reset last message ID for the new group
        messagesDiv.innerHTML = ''; // Clear current messages
        usersDiv.innerHTML = ''; // Clear current users
        messages = JSON.parse(localStorage.getItem(currentGroupId ? `groupMessages-${currentGroupId}` : 'globalMessages')) || [];
        
        displayedMessageIds = new Set(messages.map(msg => msg.id));

        await fetchUsers();
        await fetchMessages();
        displayMessages();// Ensure messages are displayed after fetching

        socket.emit('joinGroup', groupId);
    };

    const displayMessages = () => {
        messagesDiv.innerHTML = ''; // Clear current messages
        console.log(messages);
        messages.forEach((message) => {
            if (!currentGroupId) {
                // console.log(message)
                newMessage(message);
            } else {
                // console.log(message)
                newGroupMessage(message, message);
            }
        });
    }

    sendButton.addEventListener('click', async (event) =>{
        event.preventDefault();
        const message = messageInput.value;
        const file = fileInput.files[0]; // Get the selected file
        //console.log(file)
        if(message || file){
            try{
                // Create FormData object to send both text and fileUrl
                const formData = new FormData();
                formData.append('message', message);
                formData.append('groupId', currentGroupId);
                formData.append('file', file); // Append the file to FormData

                const response = await axios.post(currentGroupId ? "http://localhost:3000/group-message/send" : "http://localhost:3000/message/send-message",
                formData,
                {headers:{"Authorization":token, "Content-Type": "multipart/form-data"}})
                //{ message: message } because req.body.message i am using if we use message i should only use req.body only
                // console.log(response.data.name)
                if(!currentGroupId){
                  socket.emit('joinGroup', null);
                   socket.emit('message', {message: response.data, groupId: null, fileUrl:response.data})
                   await switchGroup(null);
                }
                else{
                socket.emit('joinGroup', currentGroupId);
                socket.emit('message', { message: response.data.createdMessage, groupId: currentGroupId, name: response.data.name});
                }
                messageInput.value = '';
                fileInput.value = '';
            }
            catch(err){
                console.log(err);
            }
        }
    })

    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        if (currentGroupId === null) {
            switchGroup(null); // Fetch global messages when connected to WebSocket server
        }
    });

    socket.on('message', (data) => {
        console.log('Received message:', data);
        const groupId = data.groupId;
        console.log(data)
        if (groupId === null) {
            console.log("inside socket global")
            newMessage(data.message); // If groupId is null, it's a global message
        } else {
           if(groupId === currentGroupId){
            console.log("inside group socket")
            newGroupMessage(data.message, data.name); // If groupId is present, it's a group message
          }
        }
    });

    createGroupButton.addEventListener('click', async () => {
        const groupName = prompt('Enter group name:');
        if (groupName) {
            try {
                await axios.post('http://localhost:3000/group/create', { name: groupName }, {
                    headers: { "Authorization": token }
                });
                await fetchGroups();
            } catch (err) {
                console.log(err);
            }
        }
    });

    function newMessage(message){
        
        // Append the new message to the message display area
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', 'mb-2', 'p-2', 'bg-light', 'rounded');
        if(message.fileKey === null){
            newMessage.textContent = `${message.username}: ${message.message}`;
        }
        else{
            newMessage.innerHTML = `${message.username}: ${message.message} <a href="${message.fileKey}">view</a>`
        }
        messagesDiv.appendChild(newMessage);
    }

    function newGroupMessage(message, name){
         // Append the new message to the message display area
         const newMessage = document.createElement('div');
         newMessage.classList.add('message', 'mb-2', 'p-2', 'bg-light', 'rounded');
         if(message.fileKey == null){
            newMessage.textContent = `${name.user.name}: ${message.message}`;
         }
         else{
            newMessage.innerHTML = `${name.user.name}: ${message.message} <a href="${message.fileKey}">view</a>"`;
         }
         messagesDiv.appendChild(newMessage);
    }

    await fetchGroups();
    usersDiv.addEventListener('click', ()=>{
        // console.log(currentGroupId);
        localStorage.setItem('groupId', currentGroupId);
        window.location.href = "../groupmembers/groupmembers.html"
    })
});

document.getElementById('logout').addEventListener('click', () => {
    // Clear local storage
    localStorage.clear();

    // Close WebSocket connection
    socket.disconnect();

    // Redirect to sign-in page
    window.location.href = "../signin/signin.html";
});