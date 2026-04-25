using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace VacationOptimizer.Server.Services;

public interface IResultTokenService
{
    string CreateToken(int attempt, string outputSeed, string requestFingerprint);
    ResultTokenPayload ParseToken(string token);
}

public sealed record ResultTokenPayload(
    [property: JsonPropertyName("v")] int Version,
    [property: JsonPropertyName("a")] int Attempt,
    [property: JsonPropertyName("s")] string OutputSeed,
    [property: JsonPropertyName("r")] string RequestFingerprint);

public sealed class ResultTokenException : ArgumentException
{
    public ResultTokenException(string message) : base(message)
    {
    }
}

public sealed class ResultTokenService : IResultTokenService
{
    public const int CurrentVersion = 1;

    private readonly byte[] _signingKey;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = null,
        WriteIndented = false
    };

    public ResultTokenService(string signingKey)
    {
        if (string.IsNullOrWhiteSpace(signingKey))
        {
            throw new ArgumentException("A result token signing key is required.", nameof(signingKey));
        }

        _signingKey = Encoding.UTF8.GetBytes(signingKey);
    }

    public string CreateToken(int attempt, string outputSeed, string requestFingerprint)
    {
        var payload = new ResultTokenPayload(CurrentVersion, attempt, outputSeed, requestFingerprint);
        var payloadJson = JsonSerializer.Serialize(payload, JsonOptions);
        var payloadSegment = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
        var signatureSegment = Base64UrlEncode(Sign(payloadSegment));

        return $"{payloadSegment}.{signatureSegment}";
    }

    public ResultTokenPayload ParseToken(string token)
    {
        var segments = token.Split('.');
        if (segments.Length != 2 || string.IsNullOrWhiteSpace(segments[0]) || string.IsNullOrWhiteSpace(segments[1]))
        {
            throw new ResultTokenException("Invalid result token.");
        }

        var expectedSignature = Sign(segments[0]);
        byte[] actualSignature;

        try
        {
            actualSignature = Base64UrlDecode(segments[1]);
        }
        catch (FormatException ex)
        {
            throw new ResultTokenException($"Invalid result token signature. {ex.Message}");
        }

        if (!CryptographicOperations.FixedTimeEquals(expectedSignature, actualSignature))
        {
            throw new ResultTokenException("Invalid result token signature.");
        }

        ResultTokenPayload? payload;
        try
        {
            payload = JsonSerializer.Deserialize<ResultTokenPayload>(
                Encoding.UTF8.GetString(Base64UrlDecode(segments[0])),
                JsonOptions);
        }
        catch (JsonException ex)
        {
            throw new ResultTokenException($"Invalid result token payload. {ex.Message}");
        }
        catch (FormatException ex)
        {
            throw new ResultTokenException($"Invalid result token payload. {ex.Message}");
        }

        if (payload is null || payload.Version != CurrentVersion || string.IsNullOrWhiteSpace(payload.OutputSeed) || string.IsNullOrWhiteSpace(payload.RequestFingerprint))
        {
            throw new ResultTokenException("Invalid result token payload.");
        }

        return payload;
    }

    private byte[] Sign(string payloadSegment)
    {
        using var hmac = new HMACSHA256(_signingKey);
        return hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadSegment));
    }

    private static string Base64UrlEncode(byte[] value) =>
        Convert.ToBase64String(value)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

    private static byte[] Base64UrlDecode(string value)
    {
        var base64 = value.Replace('-', '+').Replace('_', '/');
        var padding = base64.Length % 4;
        if (padding > 0)
        {
            base64 = base64.PadRight(base64.Length + 4 - padding, '=');
        }

        return Convert.FromBase64String(base64);
    }
}
