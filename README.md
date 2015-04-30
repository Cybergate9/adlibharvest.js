# adlibharvest.js
Node based [Adlib](http://www.adlibsoft.com/) data harvester (from JSON API) to RethinkDB store

It doesn't create RethinkDB database or table, so create objects->adlib on local RethinkDB

Usage: adlibharvest [options]

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -f --from [date]         From date (YYYY-MM-DD)
    -s --startfrom [number]  startfrom= [0]
    -r --requests [number]   Number of requests [10]
    -t --transform [yes|no]  Transform field names to remove dot notation [yes]
