const { decode } = require('jsonwebtoken');
const User = require('../Models/userModel')
const { Encrypt, Decrypt } = require('../crypt');
const { sign } = require('../jwt');

const controller = {}

controller.createToken = async (req, res) => {
    try{
        const token = await sign(req);
        res.status(200).json({ token });
    }catch(err){
        return res.status(500).json({"message": 'Something went wrong while signing token...'})
    }
}

controller.getUsers = async (req, res) => {
    const users = await User.find()
    res.status(200).json((users.length == 0) ? [] : users)
}

controller.createUser = async (req, res) => {
    const { username, password, name } = req.body
    const encryptedPassword = Encrypt(password);
    if(encryptedPassword[0] == "ERR") return res.status(500).json({"message": encryptedPassword[1]});
    const newUser = new User({ username, password: encryptedPassword[1], name })
    await newUser.save()
    res.status(201).json({ "message": 'User created' })
}

controller.getUser = async (req, res) => {
    const user = await User.findById(req.params.idUser)
    if(!user) return res.status(200).json({"message": 'User no exist...'});
    const decryptedPassword = Decrypt(user.password);
    if(decryptedPassword[0] == "ERR") return res.status(500).json({"message": decryptedPassword[1]});
    user.password = decryptedPassword[1];
    res.status(200).json(user)
}

controller.updateUser = async (req, res) => {
    const actualUser = await User.findById(req.params.idUser)
    if(actualUser == null){
        res.status(500).json({"message": 'Something went wrong while updating...'})
    }
    else{
        const newUserData = req.body;
        const encryptedUserData = Encrypt(newUserData.password);
        if(encryptedUserData[0] == "ERR") return res.status(500).json({"message": encryptedUserData[1]});
        newUserData.password = encryptedUserData[1];
        await User.findByIdAndUpdate(req.params.idUser, newUserData)
        res.status(200).json({ "message": 'User updated' })
    }
}

controller.deleteUser = async (req, res) => {
    const actualUsers = await User.find()
    await User.findByIdAndDelete(req.params.id)
    const newActualUsers = await User.find()
    if(actualUsers.length == newActualUsers.length){
        res.status(500).json({"message": 'Something went wrong while deleting...'})
    }else{
        res.status(200).json({"message": 'User deleted'})
    }
}

controller.getProfile = async (req, res) => {
    const user = await User.findById(req.params.idUser)
    if(user == null){
        res.status(500).json({"message": 'User no exist...'});
    }else{
        const profile = user.profiles.find(profile => profile._id.toString() === req.params.idProfile);
        if(profile) return res.status(200).json(profile);
        else return res.status(500).json({"message": 'Profile no exist...'});
    }
}

controller.updateProfile = async (req, res) => {
    const user = await User.findById(req.params.idUser)
    if(user == null){
        res.status(500).json({"message": 'User no exist...'});
    }else{
        const { username, password } = user;
        const profile = user.profiles.find(profile => profile._id.toString() === req.params.idProfile);
        if(!profile) return res.status(500).json({"message": 'Profile no exist...'});

        const { avatar, name, code, isKid, watchingTvShows, watchingMovies, wishList, favorites } = profile;
        const [newWatchingMovies = watchingMovies, newWatchingTvShows = watchingTvShows, newWishList = wishList, newFavorites = favorites] = [ [...watchingMovies], [...watchingTvShows], [...wishList], [...favorites] ];
        const { change, id } = req.query;

        if(!change || !id) return res.status(500).json({"message": 'Something went wrong...'});

        if(change == "Movies"){
            const allreadyWatchingIt = (newWatchingMovies.findIndex( movie => movie.id === id ) == -1) ? false : true;
            if(!allreadyWatchingIt) newWatchingMovies.push( { id } );
        }else if(change == "TvShows"){
            const { season, episode } = req.query;
        
            if(!season || !episode) return res.status(500).json({"message": 'Something went wrong...'});

            const watchingItIndex = newWatchingTvShows.findIndex( tvShow => tvShow.id === id );
            if(watchingItIndex != -1){
                newWatchingTvShows[watchingItIndex].progress.season = season;
                newWatchingTvShows[watchingItIndex].progress.episode = episode;
            }else{
                newWatchingTvShows.push( { id: id, progress: { season, episode } } );
            }
        }else if(change == "WishList"){
            const allreadyWishItem = (newWishList.findIndex( item => item.id === id ) == -1) ? false : true;
            if(!allreadyWishItem) newWishList.push( { id } );
        }else if(change == "Favorites"){
            const allreadyFavorite = (newFavorites.find( favorite => favorite.id === id ) == -1)? true : false;
            if(!allreadyFavorite) newFavorites.push( { id } );
        }else{
            return res.status(500).json({"message": 'Something went wrong...'});
        }

        const updatePayload = {
            $set: {
                username: username, 
                password: password,
                'profiles.$.avatar': avatar,
                'profiles.$.name': name,
                'profiles.$.code': code,
                'profiles.$.isKid': isKid,
                'profiles.$.watchingTvShows': newWatchingTvShows,
                'profiles.$.watchingMovies': newWatchingMovies,
                'profiles.$.favorites': newFavorites,
                'profiles.$.wishList': newWishList
            },
        };

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.idUser, 'profiles._id': req.params.idProfile },
            updatePayload,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User or Profile not found." });
        }

        updatedUser.password = undefined;

        res.status(200).json({ 
            message: `Profile '${name}' updated successfully.`,
            user: updatedUser 
        });
    }
}

module.exports = controller