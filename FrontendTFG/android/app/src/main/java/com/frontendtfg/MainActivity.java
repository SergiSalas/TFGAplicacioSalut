// Add these imports at the top
import android.os.Build;
import android.os.Bundle;
import android.app.NotificationChannel;
import android.app.NotificationManager;

public class MainActivity extends ReactActivity {
  // Add this method
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Create notification channel for Android 8.0+
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(
        "default_channel", 
        "Default Channel", 
        NotificationManager.IMPORTANCE_HIGH
      );
      channel.setDescription("Default Notification Channel");
      
      NotificationManager notificationManager = getSystemService(NotificationManager.class);
      notificationManager.createNotificationChannel(channel);
    }
  }
  
  // Your existing code...
}