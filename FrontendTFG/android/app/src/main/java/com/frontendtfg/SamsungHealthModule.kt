package com.frontendtfg

import android.util.Log
import com.facebook.react.bridge.*
import com.samsung.android.sdk.health.data.HealthDataService
import com.samsung.android.sdk.health.data.HealthDataStore
import com.samsung.android.sdk.health.data.HealthConstants
import com.samsung.android.sdk.health.data.HealthDataResolver
import com.samsung.android.sdk.health.data.error.HealthDataException
import com.samsung.android.sdk.health.data.permission.HealthPermissionManager
import com.samsung.android.sdk.health.data.permission.HealthPermissionManager.PermissionKey
import com.samsung.android.sdk.health.data.permission.HealthPermissionManager.PermissionType
import java.util.HashSet
import kotlin.io.use

class SamsungHealthModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val TAG = "SamsungHealthModule"
    private var healthDataStore: HealthDataStore? = null

    override fun getName(): String {
        return "SamsungHealth"
    }

    /**
     * Inicializa el SDK usando la forma Beta2: HealthDataService.getStore(context).
     * No se usa connectService() ni ConnectionListener.
     */
    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            // Se obtiene el HealthDataStore desde HealthDataService
            healthDataStore = HealthDataService.getStore(reactApplicationContext)
            // Normalmente aquí podrías hacer validaciones o checks adicionales.
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.message)
        }
    }

    /**
     * Solicita permisos de lectura (p.ej. pasos, heart rate).
     * Beta2: no hay connectService() ni ConnectionListener. Se llama directamente a requestPermissions.
     */
    @ReactMethod
    fun requestPermissions(promise: Promise) {
        try {
            val permKeys = HashSet<PermissionKey>()
            permKeys.add(
                PermissionKey(
                    HealthConstants.StepCount.HEALTH_DATA_TYPE,
                    PermissionType.READ
                )
            )
            permKeys.add(
                PermissionKey(
                    HealthConstants.HeartRate.HEALTH_DATA_TYPE,
                    PermissionType.READ
                )
            )

            val granted = healthDataStore?.getGrantedPermissions(permKeys)
            if (granted != null && granted.containsAll(permKeys)) {
                // Ya tenemos permisos
                promise.resolve(true)
            } else {
                // Pedimos permisos al usuario
                healthDataStore?.requestPermissions(permKeys, currentActivity)
                    ?.setResultListener { result ->
                        if (result.isSuccessful) {
                            promise.resolve(true)
                        } else {
                            promise.reject("PERMISSION_ERROR", "Permission denied or partial")
                        }
                    }
            }
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", e.message)
        }
    }

    /**
     * Ejemplo para leer pasos en un rango de tiempo usando Beta2.
     * No se usa connectService(); se realiza un readData() directamente con HealthDataStore.
     */
    @ReactMethod
    fun getStepCount(startTime: Double, endTime: Double, promise: Promise) {
        try {
            val startTimeMs = startTime.toLong()
            val endTimeMs = endTime.toLong()

            val filter = HealthDataResolver.Filter.and(
                HealthDataResolver.Filter.greaterThanEquals(HealthConstants.StepCount.START_TIME, startTimeMs),
                HealthDataResolver.Filter.lessThanEquals(HealthConstants.StepCount.START_TIME, endTimeMs)
            )

            val resolver = HealthDataResolver(healthDataStore, null)
            val request = HealthDataResolver.ReadRequest.Builder()
                .setDataType(HealthConstants.StepCount.HEALTH_DATA_TYPE)
                .setFilter(filter)
                .build()

            resolver.read(request).setResultListener { result ->
                try {
                    val stepsArray = WritableNativeArray()
                    var totalSteps = 0

                    // 'use' para cerrar el cursor automáticamente
                    result.use { cursor ->
                        while (cursor.hasNext()) {
                            val data = cursor.next()
                            val stepCount = data.getInt(HealthConstants.StepCount.COUNT)
                            totalSteps += stepCount

                            val stepData = WritableNativeMap()
                            stepData.putInt("count", stepCount)
                            stepData.putDouble(
                                "time",
                                data.getLong(HealthConstants.StepCount.START_TIME).toDouble()
                            )
                            stepsArray.pushMap(stepData)
                        }
                    }
                    promise.resolve(stepsArray)
                } catch (e: Exception) {
                    promise.reject("READ_ERROR", e.message)
                }
            }
        } catch (e: Exception) {
            promise.reject("STEP_COUNT_ERROR", e.message)
        }
    }

    /**
     * Ejemplo para leer Heart Rate en un rango de tiempo usando Beta2.
     */
    @ReactMethod
    fun getHeartRate(startTime: Double, endTime: Double, promise: Promise) {
        try {
            val startTimeMs = startTime.toLong()
            val endTimeMs = endTime.toLong()

            val filter = HealthDataResolver.Filter.and(
                HealthDataResolver.Filter.greaterThanEquals(HealthConstants.HeartRate.START_TIME, startTimeMs),
                HealthDataResolver.Filter.lessThanEquals(HealthConstants.HeartRate.START_TIME, endTimeMs)
            )

            val resolver = HealthDataResolver(healthDataStore, null)
            val request = HealthDataResolver.ReadRequest.Builder()
                .setDataType(HealthConstants.HeartRate.HEALTH_DATA_TYPE)
                .setFilter(filter)
                .build()

            resolver.read(request).setResultListener { result ->
                try {
                    val heartRateArray = WritableNativeArray()

                    result.use { cursor ->
                        while (cursor.hasNext()) {
                            val data = cursor.next()
                            val heartRate = data.getInt(HealthConstants.HeartRate.HEART_RATE)

                            val heartRateData = WritableNativeMap()
                            heartRateData.putInt("rate", heartRate)
                            heartRateData.putDouble(
                                "time",
                                data.getLong(HealthConstants.HeartRate.START_TIME).toDouble()
                            )
                            heartRateArray.pushMap(heartRateData)
                        }
                    }

                    promise.resolve(heartRateArray)
                } catch (e: Exception) {
                    promise.reject("READ_ERROR", e.message)
                }
            }
        } catch (e: Exception) {
            promise.reject("HEART_RATE_ERROR", e.message)
        }
    }
}
