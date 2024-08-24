import mongoose from 'mongoose';

const USER_MODEL = process.env.USER_MODEL;

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
    },

    password: {
        type: String,
        required: true,
    },

    avatar: {
        type: String,
    },

    isAdmin: {
        type: Boolean,
        default: false,
    }

}, {
    timestamps: true
});

UserSchema.pre("save", async function(next) {
  const user = this;

  // Check if the password field is modified since last save,
  // in case not modified, then it is not updated,
  // so no need to resalt
  if (!user.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;

    next();
});

UserSchema.methods.comparePassword = function(entredPassword) {
  const user = this;
  return bcrypt.compareSync(entredPassword, user.password);
};


const User = mongoose.model(USER_MODEL, UserSchema);

export default User;