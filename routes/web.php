<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


/*
|--------------------------------------------------------------------------
| Vehicle Routes
| @author Logesh
|--------------------------------------------------------------------------
*/

Route::get('/', 'App\Http\Controllers\VehicleController@index');
Route::post('/vehicles', 'App\Http\Controllers\VehicleController@getVehicleData');
Route::post('/directions', 'App\Http\Controllers\VehicleController@getDirections');
