const express = require('express')
const bodyparser = require('body-parser')

const axios = require('axios').default

const async = require('async')
const redis = require('redis')
const {SAMPLE_URL , INFO_URL, regE} = require('./constants')

const app = express()


const client = redis.createClient()
client.on('error', (err) => {
    console.log(err)
})

app.get('/metar/ping', (req, res, next) => {
    axios.get(SAMPLE_URL)
        .then((result) => {
            console.log(result.data)
            var dataArray = result.data.split(' ')
            console.log(dataArray)
            var responseData = {
                'data': {
                    'station': dataArray[1].split('\n')[1],
                    'last_observation': `${dataArray[0]} at ${dataArray[1].split('\n')[0]} GMT`,
                    'temperature': `${dataArray[8].split('/')[0].split('M')[1]} C`
                }
            }
            res.send(responseData)
        })
        .catch(err => res.send(err))
})




app.get('/metar/info?', async (req, res) => {
    var query_details = req.query
    var cache = req.query.nocache ? req.query.nocache : null
    if (cache == 1) {
        metarPingFetch(query_details.scode)
            .then((report)=> res.send(report))
            .catch((err)=>console.log(err))

    } else {
        return client.get(`metar:${query_details.scode}`, (err, result) => {
            if (result) {
                console.log('key found')
                const resultJSON = JSON.parse(result)
                return res.status(200).send(resultJSON)
            } else {
                metarPingFetch(query_details.scode)
                    .then((report)=> res.send(report))
                    .catch((err)=>console.log(err))
            }
        })

    }
})

const metarPingFetch = (scode) => {
    var url = INFO_URL.replace('{0}',`${scode}`)
    return new Promise((res,rej)=>{
        return axios.get(url)
            .then((result) => {
                console.log(result.data)
                var resultArray = result.data.split(' ')
                const tempArray = result.data.match(regE)
                console.log(resultArray)
                if (parseInt(resultArray[0].split('/')[0]) >= 2020) {
                    var sample = {
                        'data': {
                            'station': resultArray[1].split('\n')[1],
                            'last_observation': `${resultArray[0]} at ${resultArray[1].split('\n')[0]} GMT`,
                            'temperature': `${tempArray[0].split('/')[0].split('M0')[1]} C`
                        }
                    }
                    client.setex(`metar:${scode}`, 5 * 60, JSON.stringify(sample))
                    return res(sample)
    
                } else {
                    var sample = {
                        'data': {
                            'station': resultArray[1].split('\n')[1],
                            'last_observation': `${resultArray[0]} at ${resultArray[1].split('\n')[0]} GMT`,
                            'report_code': `${result.data.split('\n')[0]} ${result.data.split('\n')[1]}`
                        }
                    }
                    client.setex(`metar:${scode}`, 5 * 60, JSON.stringify(sample))
                    return res(sample)
                }
            })
            .catch((err) => rej(err))
    })
}

app.listen(process.env.PORT || 4000, () => { console.log('listening') })