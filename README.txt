Welcome,

To start locally:
>   Donwload the dependencies in package.json
>   run redis-server locally
>   in terminal go to the asparia directory and run <node app.js>
>   the node server will start at port:4000 and redis-server will start at default port: 6379

Endpoints available:
>   /metar/ping ->  Will generate a sample ping response for a station(scode=KHUL)
>   /metar/info? -> required param is scode=<somevalue> and will generate out the report for the given scode following the assumptions made.
                    optional param is nocache=1 and will generate a latest ping instead of checking from the redis cache and will refresh and update the redis cache.

Assumptions made:
>   The endpoint for /metar/info?scode=KSGS would generate out a JSON object of the format 

{
  "data": {
    "station": "KSGS",
    "last_observation": "2021/01/07 at 08:35 GMT",
    "temperature": "5 C"
  }
}

    if the scode report was being generated on or after the year 2020, for reports before that instead of temperature there would be report_code field that will contain the metar code for that station.

>   Both the node-server and the redis-server is instanced locally and needs to be fired up individually, first redis server and then the node project.

