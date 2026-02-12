const bcrypt = require("bcrypt")


async function createUser(db,email,password){

const hash=await bcrypt.hash(password,10)

await db.collection("users").insertOne({
email,
password:hash
})

}

module.exports={createUser}
