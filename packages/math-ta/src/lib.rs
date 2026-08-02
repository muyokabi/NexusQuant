use rayon::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BollingerBands {
    pub upper: Vec<f64>,
    pub middle: Vec<f64>,
    pub lower: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MacdOutput {
    pub macd: Vec<f64>,
    pub signal: Vec<f64>,
    pub histogram: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupertrendOutput {
    pub trend: Vec<f64>,      // Supertrend line values
    pub direction: Vec<i8>,   // 1 for bullish, -1 for bearish
}

/// Simple Moving Average (SMA)
/// Fast parallel chunks where possible or vectorized calculation.
pub fn sma(data: &[f64], period: usize) -> Vec<f64> {
    if data.is_empty() || period == 0 {
        return vec![0.0; data.len()];
    }
    let mut result = vec![0.0; data.len()];
    if data.len() < period {
        return result;
    }

    // Initialize first window sum
    let mut sum: f64 = data[..period].iter().sum();
    result[period - 1] = sum / (period as f64);

    for i in period..data.len() {
        sum += data[i] - data[i - period];
        result[i] = sum / (period as f64);
    }
    result
}

/// Exponential Moving Average (EMA)
pub fn ema(data: &[f64], period: usize) -> Vec<f64> {
    if data.is_empty() || period == 0 {
        return vec![0.0; data.len()];
    }
    let mut result = vec![0.0; data.len()];
    if data.len() < period {
        return result;
    }

    let alpha = 2.0 / (period as f64 + 1.0);
    // Simple SMA for first value
    let sma_val: f64 = data[..period].iter().sum::<f64>() / (period as f64);
    result[period - 1] = sma_val;

    for i in period..data.len() {
        result[i] = data[i] * alpha + result[i - 1] * (1.0 - alpha);
    }
    result
}

/// Relative Strength Index (RSI)
pub fn rsi(data: &[f64], period: usize) -> Vec<f64> {
    if data.is_empty() || period == 0 {
        return vec![0.0; data.len()];
    }
    let mut result = vec![0.0; data.len()];
    if data.len() <= period {
        return result;
    }

    let mut gains = vec![0.0; data.len() - 1];
    let mut losses = vec![0.0; data.len() - 1];

    for i in 1..data.len() {
        let diff = data[i] - data[i - 1];
        if diff > 0.0 {
            gains[i - 1] = diff;
        } else {
            losses[i - 1] = -diff;
        }
    }

    // First averages
    let mut avg_gain: f64 = gains[..period].iter().sum::<f64>() / (period as f64);
    let mut avg_loss: f64 = losses[..period].iter().sum::<f64>() / (period as f64);

    if avg_loss == 0.0 {
        result[period] = 100.0;
    } else {
        let rs = avg_gain / avg_loss;
        result[period] = 100.0 - (100.0 / (1.0 + rs));
    }

    for i in (period + 1)..data.len() {
        avg_gain = (avg_gain * (period as f64 - 1.0) + gains[i - 1]) / (period as f64);
        avg_loss = (avg_loss * (period as f64 - 1.0) + losses[i - 1]) / (period as f64);

        if avg_loss == 0.0 {
            result[i] = 100.0;
        } else {
            let rs = avg_gain / avg_loss;
            result[i] = 100.0 - (100.0 / (1.0 + rs));
        }
    }
    result
}

/// Moving Average Convergence Divergence (MACD)
pub fn macd(data: &[f64], fast_period: usize, slow_period: usize, signal_period: usize) -> MacdOutput {
    let fast_ema = ema(data, fast_period);
    let slow_ema = ema(data, slow_period);

    let mut macd_line = vec![0.0; data.len()];
    for i in 0..data.len() {
        macd_line[i] = fast_ema[i] - slow_ema[i];
    }

    let signal_line = ema(&macd_line, signal_period);
    let mut histogram = vec![0.0; data.len()];
    for i in 0..data.len() {
        histogram[i] = macd_line[i] - signal_line[i];
    }

    MacdOutput {
        macd: macd_line,
        signal: signal_line,
        histogram,
    }
}

/// Bollinger Bands (BB)
pub fn bollinger_bands(data: &[f64], period: usize, std_dev_multiplier: f64) -> BollingerBands {
    if data.is_empty() || period == 0 {
        return BollingerBands {
            upper: vec![0.0; data.len()],
            middle: vec![0.0; data.len()],
            lower: vec![0.0; data.len()],
        };
    }

    let middle = sma(data, period);
    let mut upper = vec![0.0; data.len()];
    let mut lower = vec![0.0; data.len()];

    for i in (period - 1)..data.len() {
        let chunk = &data[(i + 1 - period)..=i];
        let mean = middle[i];
        let variance: f64 = chunk.iter().map(|&x| {
            let diff = x - mean;
            diff * diff
        }).sum::<f64>() / (period as f64);
        let std_dev = variance.sqrt();

        upper[i] = mean + std_dev_multiplier * std_dev;
        lower[i] = mean - std_dev_multiplier * std_dev;
    }

    BollingerBands { upper, middle, lower }
}

/// Average True Range (ATR)
pub fn atr(high: &[f64], low: &[f64], close: &[f64], period: usize) -> Vec<f64> {
    if high.is_empty() || period == 0 {
        return vec![0.0; high.len()];
    }
    let len = high.len();
    let mut tr = vec![0.0; len];
    tr[0] = high[0] - low[0];

    for i in 1..len {
        let h_l = high[i] - low[i];
        let h_pc = (high[i] - close[i - 1]).abs();
        let l_pc = (low[i] - close[i - 1]).abs();
        tr[i] = h_l.max(h_pc).max(l_pc);
    }

    let mut result = vec![0.0; len];
    if len < period {
        return result;
    }

    // First ATR is SMA of True Range
    let mut current_atr: f64 = tr[..period].iter().sum::<f64>() / (period as f64);
    result[period - 1] = current_atr;

    for i in period..len {
        current_atr = (current_atr * (period as f64 - 1.0) + tr[i]) / (period as f64);
        result[i] = current_atr;
    }
    result
}

/// Volume Weighted Average Price (VWAP)
pub fn vwap(high: &[f64], low: &[f64], close: &[f64], volume: &[f64]) -> Vec<f64> {
    let len = high.len();
    let mut result = vec![0.0; len];
    if len == 0 {
        return result;
    }

    let mut cumulative_tp_v = 0.0;
    let mut cumulative_v = 0.0;

    for i in 0..len {
        let tp = (high[i] + low[i] + close[i]) / 3.0;
        cumulative_tp_v += tp * volume[i];
        cumulative_v += volume[i];

        if cumulative_v > 0.0 {
            result[i] = cumulative_tp_v / cumulative_v;
        } else {
            result[i] = tp;
        }
    }
    result
}

/// Supertrend
pub fn supertrend(high: &[f64], low: &[f64], close: &[f64], period: usize, multiplier: f64) -> SupertrendOutput {
    let len = high.len();
    let mut trend = vec![0.0; len];
    let mut direction = vec![1; len];

    if len == 0 {
        return SupertrendOutput { trend, direction };
    }

    let atr_values = atr(high, low, close, period);

    let mut upper_band = vec![0.0; len];
    let mut lower_band = vec![0.0; len];

    for i in 0..len {
        let hl2 = (high[i] + low[i]) / 2.0;
        upper_band[i] = hl2 + multiplier * atr_values[i];
        lower_band[i] = hl2 - multiplier * atr_values[i];
    }

    // Refined bands
    let mut final_upper_band = vec![0.0; len];
    let mut final_lower_band = vec![0.0; len];

    if len > 0 {
        final_upper_band[0] = upper_band[0];
        final_lower_band[0] = lower_band[0];
        trend[0] = final_upper_band[0];
        direction[0] = 1;
    }

    for i in 1..len {
        // Upper Band
        if upper_band[i] < final_upper_band[i - 1] || close[i - 1] > final_upper_band[i - 1] {
            final_upper_band[i] = upper_band[i];
        } else {
            final_upper_band[i] = final_upper_band[i - 1];
        }

        // Lower Band
        if lower_band[i] > final_lower_band[i - 1] || close[i - 1] < final_lower_band[i - 1] {
            final_lower_band[i] = lower_band[i];
        } else {
            final_lower_band[i] = final_lower_band[i - 1];
        }

        // Supertrend line and Direction
        if close[i] > final_upper_band[i - 1] {
            direction[i] = 1;
        } else if close[i] < final_lower_band[i - 1] {
            direction[i] = -1;
        } else {
            direction[i] = direction[i - 1];
            if direction[i] == 1 && final_lower_band[i] < final_lower_band[i - 1] {
                final_lower_band[i] = final_lower_band[i - 1];
            }
            if direction[i] == -1 && final_upper_band[i] > final_upper_band[i - 1] {
                final_upper_band[i] = final_upper_band[i - 1];
            }
        }

        if direction[i] == 1 {
            trend[i] = final_lower_band[i];
        } else {
            trend[i] = final_upper_band[i];
        }
    }

    SupertrendOutput { trend, direction }
}

/// Fibonacci Retracement Levels
/// Returns key Fibonacci levels (0.0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0) calculated from local high/low.
pub fn fibonacci_levels(high: &[f64], low: &[f64]) -> Vec<f64> {
    if high.is_empty() || low.is_empty() {
        return vec![0.0; 7];
    }
    let max_val = high.iter().fold(f64::MIN, |a, &b| a.max(b));
    let min_val = low.iter().fold(f64::MAX, |a, &b| a.min(b));
    let diff = max_val - min_val;

    vec![
        max_val,
        max_val - 0.236 * diff,
        max_val - 0.382 * diff,
        max_val - 0.5 * diff,
        max_val - 0.618 * diff,
        max_val - 0.786 * diff,
        min_val,
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sma() {
        let data = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let res = sma(&data, 3);
        assert_eq!(res[0], 0.0);
        assert_eq!(res[1], 0.0);
        assert_eq!(res[2], 2.0); // (1+2+3)/3 = 2
        assert_eq!(res[3], 3.0); // (2+3+4)/3 = 3
        assert_eq!(res[4], 4.0); // (3+4+5)/3 = 4
    }

    #[test]
    fn test_ema() {
        let data = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let res = ema(&data, 3);
        assert_eq!(res[2], 2.0); // first window SMA
        assert!(res[3] > 2.0);
    }

    #[test]
    fn test_rsi() {
        let data = vec![10.0, 11.0, 12.0, 11.0, 10.0, 11.0];
        let res = rsi(&data, 3);
        assert_eq!(res.len(), 6);
    }

    #[test]
    fn test_fib() {
        let high = vec![100.0, 110.0, 105.0];
        let low = vec![90.0, 85.0, 95.0];
        let fib = fibonacci_levels(&high, &low);
        assert_eq!(fib[0], 110.0); // Max
        assert_eq!(fib[6], 85.0);  // Min
        assert!((fib[3] - 97.5).abs() < 1e-5); // 50% retracement
    }
}
