// const asyncHandler =()=>{

// }

export default asyncHandler

//different ways to create the async Handler function

// const asyncHandler =()=>{}
// const asyncHandler =(fun) => ()=> {}
// const asyncHandler =(fun)=> async()=>{}

//By the use of Try and Catch Method

// const asyncHandler =(fn)=> async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 404).json({
//             message: err.message
//         })
//     }
// }