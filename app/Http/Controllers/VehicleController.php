<?php

/**
 * Vechile controller class
 *
 * This resource class perform Vechile related Operations
 *
 * @package App\Http\Controllers
 * @author  Logesh sankar
 */

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    /**
     * Render main page
     * @Rest\GET("/")
     */
    public function index(Request $request)
    {
        return view('vechile');
    }

    /**
     * Retrieves the last vechicle data
     * @throws FatalThrowableError message  invalid API user when not valid API
     *
     * @Rest\POST("/vehicles")
     */
    public function getVehicleData(Request $request)
    {
        try {
            $key = $request->input('apiKey');
            if (!empty($key)) {
                $apiURL = config('fleet')['url'];
                $format = config('fleet')['format'];
                $apiFunction = config('fleetapi')['Vehicles']['recentData'];
                $response = Http::get($apiURL . $apiFunction . '?key=' . $key . '&' . $format);
                $decode = json_decode($response);
                if (!empty($decode->response)) {
                    return $decode->response;
                } else {
                    return $decode->errormessage;
                }
            }
        } catch (\Exception $e) {
            $errorData = [
                'params' => func_get_args(),
                'catch_message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Retrieves the vechicle data travelled route on the selected date
     * @throws FatalThrowableError message  invalid API user when not valid API
     *
     * @Rest\POST("/directions")
     */
    public function getDirections(Request $request)
    {
        try {
            $apiURL = config('fleet')['url'];
            $format = config('fleet')['format'];
            $apiFunction = config('fleetapi')['Vehicles']['rawData'];
            $key = $request->input('apiKey');
            $objectID = $request->input('objectID');
            $selectedDate = $request->input('date');
            $endDate = date('Y-m-d', strtotime($selectedDate . ' +1 day'));
            $response = Http::get($apiURL . $apiFunction . '?objectId=' . $objectID . '&begTimestamp=' . $selectedDate . '&endTimestamp=' . $endDate . '&key=' . $key . '&' . $format);
            $decode = json_decode($response);
            return $decode->response;
        } catch (\Exception $e) {
            $errorData = [
                'params' => func_get_args(),
                'catch_message' => $e->getMessage(),
            ];
        }
    }
}
