import pandas as pd
from sklearn.model_selection import train_test_split
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import r2_score

data = pd.read_csv('esg_score.csv')

le_esg_risk_level = LabelEncoder()
data['ESG Risk Level'] = le_esg_risk_level.fit_transform(data['ESG Risk Level'])

def convert_percentile_to_numeric(percentile):
    if isinstance(percentile, str):
        if 'th' in percentile:
            return float(percentile.split('th')[0])
        elif 'rd' in percentile:
            return float(percentile.split('rd')[0])
        elif 'nd' in percentile:
            return float(percentile.split('nd')[0])
        elif 't' in percentile:
            return float(percentile.split('st')[0])
        else:
            return float(percentile)
    else:
        return percentile

data['ESG Risk Percentile'] = data['ESG Risk Percentile'].apply(convert_percentile_to_numeric)

# Handle missing values for 'Controversy Score'
data['Controversy Score'].fillna(data['Controversy Score'].mean(), inplace=True)

imputer = SimpleImputer(strategy='mean')
data['ESG Risk Percentile'] = imputer.fit_transform(data[['ESG Risk Percentile']])

# Add controversy score to the features
features = ['Total ESG Risk score', 'Controversy Score']  
X = data[features]
y = data['ESG Risk Percentile']  

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = xgb.XGBRegressor(objective='reg:squarederror', max_depth=5, learning_rate=0.1, n_estimators=1000, n_jobs=-1)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = r2_score(y_test, y_pred)
print(f'Model Accuracy: {accuracy:.3f}')

new_data = pd.DataFrame({'Total ESG Risk score': [18.8], 
                         'Controversy Score': [2]})  
predicted_esg_risk_percentile = model.predict(new_data)
print(f'Predicted ESG Risk Percentile: {predicted_esg_risk_percentile[0]:.0f}')

import joblib

# Save the model
joblib.dump(model, 'esg_model.joblib')
print("Model saved as 'esg_model.joblib'")