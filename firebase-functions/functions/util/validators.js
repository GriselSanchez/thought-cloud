/* remember: an empty string is falsey */

const isEmail = (email) => {
    const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email.match(regEx);
};

exports.validateSignUpData = (data) => {
    let errors = {};

    if (!data.email || !isEmail(data.email))
        errors.email = 'Must be a valid email address';
    if (!data.email) errors.email = 'Must not be empty';

    if (!data.password) errors.password = 'Must not be empty';
    if (!data.confirmPassword) errors.confirmPassword = 'Must not be empty';
    if (data.password && (data.password !== data.confirmPassword))
        errors.confirmPassword = 'Passwords must match';

    if (!(data.handle)) errors.handle = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
};

exports.validateLoginData = (data) => {
    let errors = {};

    if (!data.email) errors.email = 'Must not be empty';
    if (!data.password) errors.password = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
};

exports.reduceUserDetails = (data) => {
    let userDetails = {};
    if (data.bio) userDetails.bio = data.bio;
    if (data.website) {
        // add http to link
        if (data.website.trim().substring(0, 4) !== 'http')
            userDetails.website = `https://${data.website.trim()}`;
        else userDetails.website = data.website;
    }
    if (data.location) userDetails.location = data.location;
    return userDetails;
}