const mongoose=require('mongoose');  //importing mongoose
const validator=require('validator'); //importing validator
const bcrypt=require('bcryptjs'); //importing bcrypt
const jwt=require('jsonwebtoken');
const Task=require('./task')

const userSchema=new mongoose.Schema({  
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required: true
        }
        }],
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        },
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    avatar:{
        type: Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON=function(){
    const user=this;
    const userObject=user.toObject();
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.methods.generateAuthToken= async function() {
    const user=this;
    const token=jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);
    
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token;
}

userSchema.statics.findByCredentials= async (email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch= await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user;
}

//Hash the plain text password before saving
userSchema.pre('save',async function (next) {
    if(this.isModified('password')) {
        this.password=await bcrypt.hash(this.password,8)
    }
    next()
})

//Delete user tasks when user is removed
userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User', userSchema);

module.exports=User; 