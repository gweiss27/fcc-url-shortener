const getShortUrlKey = id => {
    let sum = 0;
    sum = JSON.stringify(id)
        .split('')
        .reduce((sum, digit) => {
            const regex = RegExp('[^a-z0-9]', 'i');
            if (regex.test(digit)) return sum;

            try {
                let val = parseInt(digit, 16);
                sum += val;
            } catch (err) {
                console.log('LETTER!');
            }
            return sum;
        }, sum);

    let base62Array = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(
        ''
    );
    let encodedUrlHash = '';
    sum = sum * 31 * Math.floor(Math.random() * Math.floor(100));

    let base62index = 0;
    while (sum > 0) {
        base62index = sum % 62;
        encodedUrlHash += base62Array[base62index];
        sum = Math.floor(sum / 62);
    }
    return encodedUrlHash;
};

exports.getShortUrlKey = getShortUrlKey;
