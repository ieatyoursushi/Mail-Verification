//alot of stock data will be given by the external api
//each user object will be on average ranging from  few kilabytes to a few hundred kilabytes worth of data not including images.
const user1 = {
    email: "noob918392@gmail.com", password: "userdb1234", data: {
        user_status: {
            username: '3brown1blue',
            name: { first: 'Grant', last: 'Sanderson' },
            isAdmin: true,
            bio: 'hi my name is name',
            account_id: 'tKZ7UXOT013m9xOvVSM4oKFCU',
            //likely will not be used due to the sheer size of images (5-50 KB)
            profile_picture: 'profilepic.png',
            followers: 25,
            following: 3,
            isOnline: false,
            isPrivate: false,
            lastOnline: '6/14/2006',
            timezone: 'PST',
        },
        user_settings: {
            isDarkMode: true,
            action_default: 'Buy',
            type_default: 'Market',
            quantity_default: 10,
        },
        portfolio_data: {
            positions: [
                {
                    symbol: 'AAPL',
                    shares: [
                        { share_amount: 30, accumulation_date: { date: '10/11/2022', time: '12:55AM' }, price: 112.50 },
                        { share_amount: 71, accumulation_date: { date: '12/19/2022', time: '12:55AM' }, price: 122 },
                    ],
                    //calced from shares endpoint
                    share_amount: 101,
                    cost_average: 119.18
                },
            ],
            watchlist: [
                { name: 'bluechips', stocks: ['AAPL', 'GOOG', 'QYLD', 'GME', 'BBBY', 'O', 'META'] },
            ],
            balance: 219020.01,
            balance_history: [102592, 152930, 92518.49, 219020.01],
            buying_power: 30826.38,
            //date_filled can either be a specified pont of time or pending, like a promise.
            orders: [
                {
                    type: 'Limit',
                    status: 'Filled',
                    action: 'Sell',
                    symbol: 'META',
                    amount: 5,
                    date_placed: { date: '10/11/2021', time: '6:54PM' },
                    date_filled: { date: '10/12/2021', time: '1:00PM' },
                    price_placed: 155.90,
                    price_filled: 155.90
                }
            ],
        },
        global_chat_history: [
            { message: 'At vero eos et accusamus et iusto', date_posted: { date: '9/23/2024', time: '2:29PM' }, likes: 2, post_id: 'tKZ7UXOT013m' }
        ],
        direct_messages: [
            {
                members: ['user1', 'user2'],
                messages: [
                    { author: 'user2', message: 'lorem ipsum', date_posted: '' }

                ]
            }
        ]
    }
}