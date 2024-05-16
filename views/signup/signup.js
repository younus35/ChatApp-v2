const form = document.querySelector("form")

form.addEventListener('submit', async (event)=>{
    try{
    event.preventDefault()

    let user_details ={
        user:event.target.username.value,
        email:event.target.email.value,
        phno:event.target.phno.value,
        password:event.target.password.value
    }
    const response = await axios.post("http://localhost:3000/user/signup",user_details)
    if(response.data.message == 'Email already exists'){
        const message = document.querySelector('.hidden')
        message.innerHTML = '<p class="text-center text-danger mt-2 mb-0">email already exist</p>'
    }
   }
  catch(err){
    console.log(err);
  } 
})