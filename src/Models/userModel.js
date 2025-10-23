const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    profiles: {
        type: [
            {
                avatar:{
                    type: String,
                },
                name: {
                    type: String,
                    required: true,
                },
                code: {
                    type: Number,
                    minlength: 4,
                    maxlength: 4,
                },
                isKid: {
                    type: Boolean,
                    required: true,
                    default: false,
                },
                watchingTvShows: {
                    type: [
                        {
                            id: {
                                type: String,
                                required: true,
                            },
                            progress: {
                                type: {
                                    season: { type: Number, default: 1 },
                                    episode: { type: Number, default: 1 },
                                },
                            },
                        }
                    ], 
                    default: [],
                },
                watchingMovies: {
                    type: [
                        {
                            id: {
                                type: String,
                                required: true,
                            },
                        }
                    ], 
                    default: [],
                },
                wishList:{
                    type: [
                        {
                            id: {
                                type: String,
                                required: true,
                            },
                        }
                    ], 
                    default: [],
                },
                favorites:{
                    type: [
                        {
                            id: {
                                type: String,
                                required: true,
                            },
                        }
                    ], 
                    default: [],
                }
            }
        ], default: [
            { name: 'Profile 1', isKid: false, avatar: '<default avatar icon route>' },
            { name: 'Profile 2', isKid: false, avatar: '<default avatar icon route>' },
            { name: 'Profile 3', isKid: false, avatar: '<default avatar icon route>' },
            { name: 'Profile 4', isKid: false, avatar: '<default avatar icon route>' },
            { name: 'Profile 5', isKid: false, avatar: '<default avatar icon route>' },
        ],
    }
}, {
    timestamps: true
})

module.exports = model('User', userSchema)