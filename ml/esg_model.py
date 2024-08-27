import sys
import pandas as pd
import joblib

# Load the pre-trained model
model = joblib.load('esg_model.joblib')

def predict_percentile(esg_score, controversy_score):
    new_data = pd.DataFrame({
        'Total ESG Risk score': [float(esg_score)],
        'Controversy Score': [float(controversy_score)]
    })
    
    predicted_percentile = model.predict(new_data)[0]
    return predicted_percentile

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python esg_model.py <esg_score> <controversy_score>")
        sys.exit(1)

    esg_score = float(sys.argv[1])
    controversy_score = float(sys.argv[2])
    
    percentile = predict_percentile(esg_score, controversy_score)
    print(f"{percentile:.2f}")