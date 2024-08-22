$(document).ready(function () {
    $('#messageArea').on('submit', function (event) {
        event.preventDefault();

        const currentTime = new Date().toLocaleTimeString();
        const userInput = $('#text').val().trim();
        const fileInput = $('#fileInput')[0].files[0];

        if (userInput || fileInput) {
            let formData = new FormData();
            formData.append('msg', userInput);
            if (fileInput) {
                formData.append('file', fileInput);
            }

            if (userInput) {
                const userHtml = `
                    <div class="d-flex justify-content-end mb-4">
                        <div class="msg_cotainer_send">${userInput}<span class="msg_time_send">${currentTime}</span></div>
                        <div class="img_cont_msg"><img src="https://static.vecteezy.com/system/resources/previews/008/442/086/non_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg" class="rounded-circle user_img_msg"></div>
                    </div>
                `;
                $('#messageFormeight').append(userHtml);
            }

            if (fileInput) {
                const fileHtml = `
                    <div class="d-flex justify-content-end mb-4">
                        <div class="msg_cotainer_send">File sent<span class="msg_time_send">${currentTime}</span></div>
                        <div class="img_cont_msg"><img src="https://static.vecteezy.com/system/resources/previews/008/442/086/non_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg" class="rounded-circle user_img_msg"></div>
                    </div>
                `;
                $('#messageFormeight').append(fileHtml);
            }

            $('#messageFormeight').scrollTop($('#messageFormeight')[0].scrollHeight);

            $.ajax({
                url: '/get',
                method: 'POST',
                data: formData,
                contentType: false,
                processData: false,
            }).done(function (data) {
                const botHtml = `
                    <div class="d-flex justify-content-start mb-4">
                        <div class="img_cont_msg"><img src="https://cdn4.iconfinder.com/data/icons/mysticism/2023/all-seeing_eye_illuminati-1024.png" class="rounded-circle user_img_msg"></div>
                        <div class="msg_cotainer">${data}<span class="msg_time">${currentTime}</span></div>
                    </div>
                `;
                $('#messageFormeight').append(botHtml);
                $('#messageFormeight').scrollTop($('#messageFormeight')[0].scrollHeight);
            }).fail(function (xhr, status, error) {
                console.error('Message sending failed:', status, error);
            });

            $('#text').val('');
            $('#fileInput').val(null);
        }
    });
});
