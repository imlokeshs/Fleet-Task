<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as fleet services. This file provides a sane
    | default location for this type of information, allowing packages
    | to have a conventional place to find your various credentials.
    |
    */

    'Vehicles' => [
        'recentData' => '/Vehicles/getLastData',
        'rawData' => '/Vehicles/getRawData',
    ],
];
