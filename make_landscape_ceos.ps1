Add-Type -AssemblyName System.Drawing

function Create-NaturalLandscapeCEO {
    param (
        [string]$SourcePath,
        [string]$TargetPath,
        [int]$TargetWidth = 1280,
        [int]$TargetHeight = 720,
        [int]$SrcX = 0,
        [int]$SrcY = 0,
        [int]$SrcW = 0,
        [int]$SrcH = 0,
        [System.Drawing.Color]$BgColor,
        [float]$FgScale = 0.95
    )

    if (-not (Test-Path $SourcePath)) {
        Write-Warning "Source not found: $SourcePath"
        return
    }

    $bytes = [System.IO.File]::ReadAllBytes($SourcePath)
    $ms = New-Object System.IO.MemoryStream($bytes, 0, $bytes.Length)
    $srcImg = [System.Drawing.Image]::FromStream($ms)

    if ($SrcW -le 0) { $SrcW = $srcImg.Width }
    if ($SrcH -le 0) { $SrcH = $srcImg.Height }

    $destBitmap = New-Object System.Drawing.Bitmap($TargetWidth, $TargetHeight, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($destBitmap)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # 1. Fill canvas with the ambient studio background color
    $bgBrush = New-Object System.Drawing.SolidBrush($BgColor)
    $g.FillRectangle($bgBrush, 0, 0, $TargetWidth, $TargetHeight)
    $bgBrush.Dispose()

    # 2. Add subtle studio radial glow / vignette in center behind CEO
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $TargetWidth, $TargetHeight)
    $pbg = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
    $pbg.CenterPoint = New-Object System.Drawing.PointF(($TargetWidth / 2), ($TargetHeight / 2))
    $pbg.CenterColor = [System.Drawing.Color]::FromArgb(40, 255, 255, 255)
    $pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $g.FillPath($pbg, $path)
    $pbg.Dispose()
    $path.Dispose()

    # 3. Size and draw foreground portrait in center
    $fgH = [int]($TargetHeight * $FgScale)
    $fgW = [int]($SrcW * ($fgH / [float]$SrcH))
    $fgX = [int](($TargetWidth - $fgW) / 2)
    $fgY = $TargetHeight - $fgH # Sit on the bottom of the card

    $srcRect = New-Object System.Drawing.Rectangle($SrcX, $SrcY, $SrcW, $SrcH)
    $destRect = New-Object System.Drawing.Rectangle($fgX, $fgY, $fgW, $fgH)

    $g.DrawImage($srcImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    # 4. Soft blend outer left and right edges into the background color
    $fadeWidth = 60
    # Left edge fade
    $leftGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF($fgX, 0)),
        (New-Object System.Drawing.PointF(($fgX + $fadeWidth), 0)),
        $BgColor,
        [System.Drawing.Color]::FromArgb(0, $BgColor.R, $BgColor.G, $BgColor.B)
    )
    $g.FillRectangle($leftGrad, $fgX, 0, $fadeWidth, $TargetHeight)
    $leftGrad.Dispose()

    # Right edge fade
    $rightGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(($fgX + $fgW - $fadeWidth), 0)),
        (New-Object System.Drawing.PointF(($fgX + $fgW), 0)),
        [System.Drawing.Color]::FromArgb(0, $BgColor.R, $BgColor.G, $BgColor.B),
        $BgColor
    )
    $g.FillRectangle($rightGrad, ($fgX + $fgW - $fadeWidth), 0, $fadeWidth, $TargetHeight)
    $rightGrad.Dispose()

    $g.Dispose()
    $srcImg.Dispose()
    $ms.Dispose()

    # Save
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)

    $destBitmap.Save($TargetPath, $codec, $encoderParams)
    $destBitmap.Dispose()

    Write-Host "Created clean studio landscape portrait: $TargetPath"
}

# 1. Nike (Elliott Hill) - Studio Grey Background #c8c8c8
Create-NaturalLandscapeCEO `
    -SourcePath "C:\Users\HP\.gemini\antigravity-ide\brain\cc6c6563-e18f-4b3b-9207-bf7fc5468a16\.tempmediaStorage\media_1790602704262.jpg" `
    -TargetPath "d:\WZA\assets\ceos\nike.jpg" `
    -SrcX 0 -SrcY 150 -SrcW 2457 -SrcH 2800 `
    -BgColor ([System.Drawing.Color]::FromArgb(198, 198, 202)) `
    -FgScale 1.0

# 2. OpenAI (Sam Altman) - Warm Birch Wall Background #e2ba6d
Create-NaturalLandscapeCEO `
    -SourcePath "C:\Users\HP\.gemini\antigravity-ide\brain\cc6c6563-e18f-4b3b-9207-bf7fc5468a16\.tempmediaStorage\media_1790602133348.jpg" `
    -TargetPath "d:\WZA\assets\ceos\openai.jpg" `
    -SrcX 0 -SrcY 0 -SrcW 390 -SrcH 520 `
    -BgColor ([System.Drawing.Color]::FromArgb(226, 186, 109)) `
    -FgScale 1.0

# 3. Google (Sundar Pichai) - Deep EU Blue / Tech Stage Blue #2c4270
Create-NaturalLandscapeCEO `
    -SourcePath "C:\Users\HP\.gemini\antigravity-ide\brain\cc6c6563-e18f-4b3b-9207-bf7fc5468a16\.tempmediaStorage\media_1790601740093.jpg" `
    -TargetPath "d:\WZA\assets\ceos\google.jpg" `
    -SrcX 0 -SrcY 0 -SrcW 959 -SrcH 1120 `
    -BgColor ([System.Drawing.Color]::FromArgb(44, 66, 112)) `
    -FgScale 1.0

# 4. Spotify (Daniel Ek) - Royal European Flag Blue #1b3576
Create-NaturalLandscapeCEO `
    -SourcePath "C:\Users\HP\.gemini\antigravity-ide\brain\cc6c6563-e18f-4b3b-9207-bf7fc5468a16\.tempmediaStorage\media_1790602155974.jpg" `
    -TargetPath "d:\WZA\assets\ceos\spotify.jpg" `
    -SrcX 0 -SrcY 0 -SrcW 1280 -SrcH 1380 `
    -BgColor ([System.Drawing.Color]::FromArgb(27, 53, 118)) `
    -FgScale 1.0
