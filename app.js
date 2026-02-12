require("dotenv").config()

const express=require("express")
const workoutsRoutes=require("./routes/workouts")
const authRoutes=require("./routes/auth")
const connectDB=require("./database/mongo")
const session=require("express-session")

const app=express()

app.use(session({
secret:process.env.SESSION_SECRET||"fittrack",
resave:false,
saveUninitialized:false,
cookie:{
httpOnly:true,
secure:process.env.NODE_ENV==="production",
sameSite:"strict"
}
}))
app.use(express.json())
app.use(express.static("frontend"))

app.use((req,res,next)=>{
console.log(`${req.method} ${req.url}`)
next()
})

connectDB()
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err))

app.use("/auth",authRoutes)
app.use("/api/workouts",workoutsRoutes)

app.use((req,res)=>{
res.status(404).json({message:"Route not found"})
})

const PORT=process.env.PORT||3000

app.listen(PORT,()=>{
console.log("Server running on port "+PORT)
})
